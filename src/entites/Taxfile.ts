import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsAlphanumeric, IsPostalCode, Matches, MaxLength, IsOptional } from "class-validator";
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { IsMaritalStatus } from "./dataValidations/IsMaritalStatus";
import { MaritalStatus } from "./MaritalStatus";
import { Provinces } from "./Provinces";
import { User } from "./User";
import { Profile } from "./Profile";

@Entity()
export class Taxfile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    profile_id_fk: number;

    @Column({ nullable: true })
    firstname: string;

    @Column({ nullable: true })
    lastname: string;

    @Column({ type: "date", nullable: true })
    date_of_birth: Date;

    @Column({ nullable: true })
    marital_status: string;

    @Column({ nullable: true })
    street_number: string;

    @Column({ nullable: true })
    street_name: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    province: string;

    @Column({ nullable: true })
    postal_code: string;

    @Column({ nullable: true })
    mobile_number: string;

    @Column({ nullable: true })
    taxfile_province: string;

    @Column({ nullable: true })
    moved_to_canada: string;

    @Column({ nullable: true })
    date_of_entry: string;

    @Column({ nullable: true })
    direct_deposit_cra: string;

    @Column({ nullable: true })
    document_direct_deposit_cra: string;

    @Column({ default: 'NEW_REQUEST' })
    file_status: string;

    @Column({ type: "timestamp", nullable: true })
    file_status_updated_on: Date;

    @Column({ nullable: true })
    file_status_updated_by: number;

    @Column()
    // @Matches(/^\d{4}$/, {
    //     message: 'Invalid Tax Year',
    // })
    tax_year: string;

    @Column({ default: 0, nullable: true })
    client_message_count: number;

    @Column({ type: "timestamp", nullable: true })
    client_last_msg_time: Date;

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


    @Column({ nullable: true })
    user_id: number;

    @ManyToOne(() => MaritalStatus, (marital_status) => marital_status.taxfiles)
    @JoinColumn({ name: 'marital_status' })
    marital_status_detail: MaritalStatus

    @ManyToOne(() => Provinces, (province) => province.taxfiles)
    @JoinColumn({ name: 'province' })
    province_detail: Provinces

    @ManyToOne(() => User, (user) => user.taxfiles)
    @JoinColumn({ name: 'user_id' })
    user_detail: User


    // @ManyToOne(() => Profile, (profile) => profile.taxfiles)
    // @JoinColumn({ name: 'profile_id_fk' })
    // profile_detail: Profile

}
