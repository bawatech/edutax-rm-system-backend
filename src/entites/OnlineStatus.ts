import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "online_status" })
export class OnlineStatus {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    socket_id: string;

    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    room: string;

    @Column({ type: 'enum', enum: ['CLIENT', 'EXECUTIVE'], nullable: true })
    user_type: string;

    @Column({ type: 'enum', enum: ['YES', 'NO'], nullable: true })
    in_chat: string;

}
