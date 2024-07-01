import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, } from "typeorm";

import { Executive } from "./Executive";
import { User } from "./User";

@Entity({ name: "chat_msg" })
export class ChatMsg {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: "text", nullable: true })
    message: string;

    @Column({ default: 'GENERAL', nullable: true })
    category: string;

    @Column({ type: 'enum', enum: ['CLIENT', 'EXECUTIVE'], nullable: true })
    user_type: string;

    @Column({ nullable: true })
    client_id_fk: number;

    @Column({ nullable: true })
    executive_id_fk: number;

    @Column({ nullable: true })
    reply_to_id_fk: number;



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

    @ManyToOne(() => Executive, (executive) => executive.profiles)
    @JoinColumn({ name: 'executive_id_fk' })
    executive_detail: Executive

    @ManyToOne(() => User, (user) => user.profiles)
    @JoinColumn({ name: 'user_id_fk' })
    user_detail: User


}