import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity({ name: "marital_status" })
export class MaritalStatus {
    
    @PrimaryColumn()
    code: string;

    @Column({ length: 255 })
    name: string;

}
