import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Documents } from "./Documents";

@Entity({ name: "document_types" })
export class DocumentTypes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: true})
    code: string;

    @Column()
    name: string;

    @Column({ default: 'CLIENT',type: 'enum', enum: ['CLIENT', 'EXECUTIVE'], nullable: true })
    user_type: string;

    @OneToMany(() => Documents, (document) => document.type)
    documents: Documents[]

}
