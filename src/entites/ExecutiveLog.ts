
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class ExecutiveLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    executive_id_fk: number;

    @Column()
    key: string;

    @Column({ length: 10 })
    privs: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    deleted_on: Date | null;
}
