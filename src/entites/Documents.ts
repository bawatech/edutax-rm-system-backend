import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { DocumentTypes } from "./DocumentTypes";
import { IsDefined } from "class-validator";

@Entity({ name: "documents" })
export class Documents {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    taxfile_id_fk: number;

    @Column()
    user_id_fk: number;

    @Column()
    type_id_fk: number;

    @Column()
    filename: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @ManyToOne(() => DocumentTypes, (document) => document.documents)
    @JoinColumn({ name: 'type_id_fk' })
    @IsDefined()
    type: DocumentTypes
    

}
