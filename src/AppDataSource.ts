import { DataSource } from "typeorm"
export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "employee_management",
    synchronize: true,
    logging: true,
    entities: ["src/entites/*{.ts,.js}"],
    migrations: [],
    subscribers: [],
})