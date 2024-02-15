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

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;


    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    deleted_on: Date | null;

}