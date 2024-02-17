import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "marital_status" }) // Set the table name explicitly
export class MaritalStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    code: string;

    @Column({ length: 255 })
    name: string;

}
