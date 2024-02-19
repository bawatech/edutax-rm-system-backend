import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { IsEmail } from "class-validator";
import { IsUniqueUser } from "./dataValidations/IsUniqeUser";
import { IsStrongPassword } from "./dataValidations/strongPassword";
import { Messages } from "./messages";
import { Taxfile } from "./Taxfile";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    // @Length(8, 20, { message: 'Password must be between 8 and 20 characters long' })
    @IsStrongPassword()
    password: string

    @Column()
    @IsEmail()
    @IsUniqueUser()
    email: string;

    @Column()
    otp: string;

    @Column({ default: 'PENDING', type: 'enum', enum: ['PENDING', 'VERIFIED'] })
    verify_status: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ default: 'PENDING', type: 'enum', enum: ['PENDING', 'ACCEPTED'] })
    spouse_invite_status: string;

    @Column({ type: "text" })
    spouse_invite_token: string;

    @Column()
    spouse_email: string;

    @Column()
    spouse_id: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    deleted_on: Date | null;

    @OneToMany(() => Messages, (message) => message.user_detail)
    profiles: Messages[]

    @OneToMany(() => Taxfile, (taxfile) => taxfile.user_detail)
    taxfiles: Taxfile[]

}