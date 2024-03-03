
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TaxfileStatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    taxfile_id_fk: number;

    @Column({ nullable: true })
    last_file_status: string;


    @Column({ type: "timestamp", nullable: true })
    last_file_status_updated_on: Date;

    @Column({ nullable: true })
    last_file_status_updated_by: number;

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
