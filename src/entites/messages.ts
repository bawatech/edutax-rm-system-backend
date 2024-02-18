import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, JoinTable } from "typeorm";
import { IsEmail, Length } from "class-validator";
import { IsUniqueUser } from "./dataValidations/IsUniqeUser";
import { Executive } from "./Executive";

@Entity({ name: "messages" }) // Set the table name explicitly
export class Messages {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    taxfile_id_fk: number;

    @Column({ type: "text" })
    message: string;

    @Column()
    category: string;

    @Column({ type: 'enum', enum: ['CLIENT', 'EXECUTIVE'] })
    user_type: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @Column()
    added_by: number;


    // // Define the association with the Executive entity
    // @ManyToOne(type => Executive)
    // @JoinColumn({ name: 'id' }) // Specify the foreign key column
    // executive: Executive; // This property represents the association with the Executive entity

    // @OneToOne(type => Executive, userTable => userTable.user_type)
    // @JoinTable({
    //     name: "Executive", // name of the intermediate table
    //     joinColumn: { name: "user_type", referencedColumnName: "user_type" }, // join column of the source entity
    //     inverseJoinColumn: { name: "added_by", referencedColumnName: "added_by" } // join column of the target entity
    // })
    // userTable: Executive;

}