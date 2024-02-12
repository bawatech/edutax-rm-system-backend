import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "document_types" })
export class DocumentTypes {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column()
    user_id_fk: number;

}
