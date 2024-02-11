import "reflect-metadata"
import express from 'express'
import { AppDataSource } from "./AppDataSource";
const app = express();
import userRoutes from './routes/user.routes'
import authRoutes from './routes/auth.routes'
app.use(express.json());
const port = process.env.APP_PORT;
AppDataSource.initialize()
    .then(() => {

        app.use('/user', userRoutes)
        app.use('/auth', authRoutes)

        app.listen(port, () => {
            console.log(`App working on ${port}`)
        })

    })
    .catch(() => {
        console.log('db not connected')
    })
