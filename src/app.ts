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
import { addOnlineStatus, deleteOnlineStatus, updateOnlineStatus } from "./contollers/socket.controller";
import { OnlineStatus } from "./entites/OnlineStatus";
import { toNull } from "./utils/commonFunctions";
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
    socket.on('register', async (data: any) => {
        if (toNull(data.room) != null) {
            socket.join(data.room);
            await addOnlineStatus(data);
            logRooms();
        } else {
            await deleteOnlineStatus(socket.id);
            socket.disconnect(true);
            socket.leave(socket.id);
        }
    });

    socket.on('focus', async () => {
        let data = { socket_id: socket.id, in_chat: "YES" };
        await updateOnlineStatus(data);
    });

    socket.on('blur', async () => {
        let data = { socket_id: socket.id, in_chat: "NO" };
        await updateOnlineStatus(data);
    });

    socket.on('message', async (data) => {
        const { roomId } = data;
        const onlineStatusRepo = AppDataSource.getRepository(OnlineStatus);
        const onlineStatus = await onlineStatusRepo.find({ where: { room: roomId } });
        for (const onlineSoc of onlineStatus) {
            let in_chat = onlineSoc.in_chat;
            let socket_id = onlineSoc.socket_id;
            if (in_chat === "YES") {
                console.log("message sent in chat screen");
                socket.to(roomId).emit('message', data);
            } else if(in_chat === "NO") {
                console.log("message sent as notification");
                io.to(socket_id).emit('notification', data);
            }
        }
      //  logRooms();
    });

    socket.on('disconnect', async () => {
        await deleteOnlineStatus(socket.id);
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
