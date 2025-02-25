import "reflect-metadata"
import express from 'express'
import { AppDataSource } from "./AppDataSource";
const app = express();
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
import executiveRoutes from './routes/executive.routes'
import cors from 'cors'

const allowedOrigins = process.env?.ALLOWED_ORIGINS?.split(',') || '';
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));
app.use(express.json());
import path from 'path';

 
const port = process.env.APP_PORT;
AppDataSource.initialize()
    .then(() => {

        app.use('/storage/documents', express.static(path.join(__dirname, '..', 'storage', 'documents'))); // for uploads

        app.use('/user', userRoutes)
        app.use('/auth', authRoutes)
        app.use('/executive',executiveRoutes)
        app.listen(port, () => {
            console.log(`App working on ${port}`)
        }) 

    })
    .catch((err) => {
        console.log('db not connected',err)
    })
