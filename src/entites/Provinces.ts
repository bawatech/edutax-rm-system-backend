import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import { Profile } from "./Profile";

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

}
