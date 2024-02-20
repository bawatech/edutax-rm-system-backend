import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { IsEmail } from "class-validator";
import { IsStrongPassword } from "./dataValidations/strongPassword";
import { IsUniqueExecutive } from "./dataValidations/IsUniqueExecutive";
import { Messages } from "./messages";

@Entity()
export class Executive {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    @IsEmail()
    @IsUniqueExecutive()
    email: string;

    @Column()
    @IsStrongPassword()
    password: string

    @Column({ default: 'EXECUTIVE', type: 'enum', enum: ['ADMIN', 'EXECUTIVE'] })
    user_type: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column()
    otp: string;

    @Column({ default: 'PENDING', type: 'enum', enum: ['PENDING', 'VERIFIED'] })
    verify_status: string;

    @Column({ type: "timestamp", nullable: true })
    added_on: Date;

    @Column({ nullable: true })
    added_by: number;

    @Column({ type: "timestamp", nullable: true })
    updated_on: Date;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ type: "timestamp", nullable: true })
    deleted_on: Date | null;

    @Column({ nullable: true })
    deleted_by: number;

    @OneToMany(() => Messages, (message) => message.executive_detail)
    profiles: Messages[]

}