import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Profile } from "./Profile";
import { Taxfile } from "./Taxfile";

@Entity({ name: "marital_status" })
export class MaritalStatus {
    
    @PrimaryColumn()
    code: string;

    @Column({ length: 255 })
    name: string;

    @OneToMany(() => Profile, (profile) => profile.marital_status_detail)
    profiles: Profile[]

    @OneToMany(() => Taxfile, (taxfile) => taxfile.marital_status_detail)
    taxfiles: Taxfile[]
}
