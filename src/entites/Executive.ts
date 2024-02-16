import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { IsEmail } from "class-validator";
import { IsStrongPassword } from "./dataValidations/strongPassword";
import { IsUniqueExecutive } from "./dataValidations/IsUniqueExecutive";

@Entity()
export class Executive {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @IsEmail()
    @IsUniqueExecutive()
    email: string;

    @Column()
    @IsStrongPassword()
    password: string

    @Column({default: 'EXECUTIVE', type: 'enum', enum: ['ADMIN', 'EXECUTIVE'] })
    user_type: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column()
    otp: string;

    @Column({ default: 'PENDING', type: 'enum', enum: ['PENDING', 'VERIFIED'] })
    verify_status: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @Column()
    added_by: number;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    deleted_on: Date | null;

}