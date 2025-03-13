import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { IsAlphanumeric, IsPostalCode, Matches, MaxLength, IsOptional } from "class-validator";
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { IsMaritalStatus } from "./dataValidations/IsMaritalStatus";
import { MaritalStatus } from "./MaritalStatus";
import { Provinces } from "./Provinces";
import { User } from "./User";
import { Profile } from "./Profile";
import { PaymentOrder } from "./PaymentOrders";
import { Taxfile } from "./Taxfile";

@Entity({name:'taxfile_comments'})
export class TaxfileComments {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    taxfile_id: number;

    @Column({ type:'text', default:"" })
    comment: string;


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


    
    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @Column({ nullable: true })
    user_id: number;

    @ManyToOne(() => Taxfile, (taxfile) => taxfile.comments)
    @JoinColumn({ name: 'taxfile_id' })
    taxfile: Taxfile
    
}
