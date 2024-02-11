import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
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

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    deleted_on: Date | null;



}