import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Profile } from "./Profile";
import { Taxfile } from "./Taxfile";

@Entity({ name: "provinces" })
export class Provinces {
    // @PrimaryGeneratedColumn()
    // id: number;

    @PrimaryColumn()
    code: string;

    @Column({ length: 255 })
    name: string;

    @OneToMany(() => Profile, (profile) => profile.province)
    profiles: Profile[]

    @OneToMany(() => Taxfile, (taxfile) => taxfile.marital_status_detail)
    taxfiles: Taxfile[]

}
