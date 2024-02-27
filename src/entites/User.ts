import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, EventSubscriber, LoadEvent, InsertEvent, UpdateEvent } from "typeorm";
import { IsEmail } from "class-validator";
import { IsUniqueUser } from "./dataValidations/IsUniqeUser";
import { IsStrongPassword } from "./dataValidations/strongPassword";
import { Messages } from "./messages";
import { Taxfile } from "./Taxfile";
import CryptoJS from 'crypto-js';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "text"})
    // @Length(8, 20, { message: 'Password must be between 8 and 20 characters long' })
    @IsStrongPassword()
    password: string

    @Column()
    @IsEmail()
    @IsUniqueUser()
    email: string;

    @Column({ nullable: true, select:false })
    otp: string;

    @Column({ default: 'PENDING', type: 'enum', enum: ['PENDING', 'VERIFIED']})
    verify_status: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ default: 'UNLINKED', type: 'enum', enum: ['UNLINKED', 'SENT', 'LINKED']})
    spouse_invite_status: string;

    @Column({ type: "text", nullable: true })
    spouse_invite_token: string;

    @Column({ nullable: true })
    spouse_email: string;

    @Column({ nullable: true })
    spouse_id: number;

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

    @Column({ default: 0, nullable: true })
    client_message_count: number;

    @Column({ type: "timestamp", nullable: true })
    client_last_msg_time: Date;

    @OneToMany(() => Messages, (message) => message.user_detail)
    profiles: Messages[]

    @OneToMany(() => Taxfile, (taxfile) => taxfile.user_detail)
    taxfiles: Taxfile[]



    // private static secretKey = 'edu@EduTax';

    // static getSecretKey(): string {
    //   return User.secretKey;
    // }

    // setEmail(email: string) {
    //   this.email = CryptoJS.AES.encrypt(email, User.getSecretKey()).toString();
    // }

    // getEmail(): string {
    //   return CryptoJS.AES.decrypt(this.email, User.getSecretKey()).toString(CryptoJS.enc.Utf8);
    // }

}
