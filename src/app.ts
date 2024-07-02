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
// import { updateUserOnlineStatus } from "./contollers/auth.controller";

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3003"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    socket.on('register', async (userId: any) => {
        socket.join(userId);
        socket.to(userId).emit('onlineStatus', { userId, onlineStatus: true });
        // await updateUserOnlineStatus(userId, true);
        logRooms();
    });

    socket.on('message', async (data) => {
        const { roomId } = data;
        socket.to(roomId).emit('message', data);
        // Send notification if receiver is offline
        // if (!Object.values(users).includes(receiverId)) {
        //     console.log(`Send notification to ${receiverId}`);
        // }
    });

    socket.on('disconnect', () => {
        socket.disconnect(true);
        socket.leave(socket.id);
        let rooms: any = io.sockets.adapter.rooms;
        logRooms();
    });

    // socket.on('discon', async (userId: any) => {

    //     socket.disconnect(true);
    //     socket.leave(socket.id);
    //     socket.leave(userId);
    //     socket.to(userId).emit('onlineStatus', { userId, onlineStatus: false });
    //     await updateUserOnlineStatus(userId, true);
    // });
});

const logRooms = () => {
    const rooms = io.sockets.adapter.rooms;
    console.log('Active rooms:');
    rooms.forEach((sockets, room) => {
        console.log(`Room: ${room}, Sockets: ${Array.from(sockets).join(', ')}`);
    });
};


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
