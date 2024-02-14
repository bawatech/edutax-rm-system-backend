import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "provinces" }) // Set the table name explicitly
export class Provinces {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    code: string;

    @Column({ length: 255 })
    name: string;

}
