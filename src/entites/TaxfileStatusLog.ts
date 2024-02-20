
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TaxfileStatusLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    taxfile_id_fk: number;

    @Column()
    last_file_status: string;


    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    last_file_status_updated_on: Date | null;

    @Column()
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
