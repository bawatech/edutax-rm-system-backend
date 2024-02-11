
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

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;
}
