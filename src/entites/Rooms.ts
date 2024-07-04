import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "rooms" })
export class Rooms {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    room: string;

    @Column({ type: 'enum', enum: ['O'], nullable: true })
    type: string;

    @Column({ type: "text", nullable: true })
    users: string;

    @Column({ type: "text", nullable: true })
    executives: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;


}
