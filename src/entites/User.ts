import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { IsEmail, Length } from "class-validator";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Length(8, 20, { message: 'Password must be between 8 and 20 characters long' })
    password: string

    @Column()
    @IsEmail()
    email: string;

    @Column()
    age: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on: Date;

}