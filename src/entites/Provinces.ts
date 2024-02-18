import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "provinces" })
export class Provinces {
    // @PrimaryGeneratedColumn()
    // id: number;

    @PrimaryColumn()
    code: string;

    @Column({ length: 255 })
    name: string;

}
