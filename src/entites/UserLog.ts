
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class UserLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id_fk: number;

    @Column({ nullable: true })
    key: string;

    @Column({nullable: true })
    privs: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ type: "timestamp", nullable: true })
    last_activity_on: Date;

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


}
