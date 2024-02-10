import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserLog {
    @PrimaryGeneratedColumn()
    ulog_id: number;

    @Column()
    ulog_user_id_fk: number;

    @Column()
    ulog_key: string;

    @Column({ length: 10 })
    ulog_privs: string;

    @Column({ length: 3 })
    ulog_id_status: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    ulog_added_on: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true })
    ulog_deleted_on: Date | null;
}
