import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, JoinTable } from "typeorm";
import { IsEmail, Length } from "class-validator";
import { IsUniqueUser } from "./dataValidations/IsUniqeUser";
import { Executive } from "./Executive";
import { User } from "./User";

@Entity({ name: "messages" }) // Set the table name explicitly
export class Messages {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    taxfile_id_fk: number;

    @Column({ type: "text" })
    message: string;

    @Column({ default: 'GENERAL', nullable: true })
    category: string;

    @Column({ type: 'enum', enum: ['CLIENT', 'EXECUTIVE'] })
    user_type: string;

    @Column({ nullable: true })
    client_id_fk: number;

    @Column({ nullable: true })
    executive_id_fk: number;


    @Column({ type: "timestamp", nullable: true })
    added_on: Date;

    @Column({ nullable: true })
    added_by: number;

    @Column({ type: "timestamp", nullable: true })
    updated_on: Date;

    @Column({ nullable: true })
    updated_by: number;

    @Column({ type: "timestamp", nullable: true })
    deleted_on: Date | null;

    @Column({ nullable: true })
    deleted_by: number;

    @ManyToOne(() => Executive, (executive) => executive.profiles)
    @JoinColumn({ name: 'executive_id_fk' })
    executive_detail: Executive

    @ManyToOne(() => User, (user) => user.profiles)
    @JoinColumn({ name: 'user_id_fk' })
    user_detail: User


}