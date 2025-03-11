import { DataSource } from "typeorm"
import dotenv from 'dotenv'
import { join } from "path"
// import { UserSubscriber } from "./subscribers/UserSub"
dotenv.config()
export const AppDataSource = new DataSource({
    type: "mysql",
    host: `${process.env.DB_HOST}`,
    port: parseInt(process.env.DB_PORT ?? "3306"),
    username: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASSWORD}`,
    database: `${process.env.DB_DATABASE}`,
    // logging: true,
    synchronize:true,
    entities: [
        join(__dirname, 'entites/*.{ts,js}'),
    ],
    migrations: [],
    subscribers: [],
})

