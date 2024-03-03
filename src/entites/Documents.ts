import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { DocumentTypes } from "./DocumentTypes";
import { IsDefined } from "class-validator";

@Entity({ name: "documents" })
export class Documents {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    taxfile_id_fk: number;

    @Column({ nullable: true })
    user_id_fk: number;

    @Column({ nullable: true })
    type_id_fk: number;

    @Column({ nullable: true })
    executive_id_fk: number;

    @Column({ default: 'CLIENT',type: 'enum', enum: ['CLIENT', 'EXECUTIVE'], nullable: true })
    user_type: string;

    @Column({ nullable: true })
    filename: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

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


    @ManyToOne(() => DocumentTypes, (document) => document.documents)
    @JoinColumn({ name: 'type_id_fk' })
    @IsDefined()
    type: DocumentTypes


}
