import "reflect-metadata";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { AppDataSource } from "./AppDataSource";
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import executiveRoutes from './routes/executive.routes';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
app.use(cors())
app.use(express.json());
import path from 'path';
import { ChatMsg } from "./entites/ChatMsg";

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3003"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

const users: { [id: string]: string } = {};

io.on('connection', (socket) => {
    socket.on('register', async (userId: string) => {
        
        users[socket.id] = userId;
        socket.join(userId);
        socket.broadcast.emit('userStatus', { userId, status: 'online' });
    });

    socket.on('message', async (data) => {
        console.log("socket headersssssssssss",socket.handshake.headers);
        const { senderId, receiverId, message } = data;
        // const messageEntity = new ChatMsg();
        // messageEntity.client_id_fk = senderId;
        // messageEntity.reply_to_id_fk = receiverId;
        // messageEntity.message = message;
        // await AppDataSource.manager.save(messageEntity);
        io.to(receiverId).emit('message', data);
        // Send notification if receiver is offline
        if (!Object.values(users).includes(receiverId)) {
            console.log(`Send notification to ${receiverId}`);
        }
    });

    socket.on('disconnect', () => {
        const userId = users[socket.id];
        delete users[socket.id];
        socket.broadcast.emit('userStatus', { userId, status: 'offline' });
        console.log(`User disconnected: ${socket.id}`);
    });
});


const port = process.env.APP_PORT;
AppDataSource.initialize()
    .then(() => {

        app.use('/storage/documents', express.static(path.join(__dirname, '..', 'storage', 'documents'))); // for uploads

        app.use('/user', userRoutes)
        app.use('/auth', authRoutes)
        app.use('/executive', executiveRoutes)
        server.listen(port, () => {
            console.log(`App working on ${port}`)
        })

    })
    .catch((err) => {
        console.log('db not connected', err)
    })
