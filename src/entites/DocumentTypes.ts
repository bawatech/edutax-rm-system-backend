import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Documents } from "./Documents";

@Entity({ name: "document_types" })
export class DocumentTypes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    name: string;

    @OneToMany(() => Documents, (document) => document.type)
    documents: Documents[]

}
