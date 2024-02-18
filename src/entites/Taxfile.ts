import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn } from "typeorm";
import { IsAlphanumeric, IsPostalCode, Matches, MaxLength, IsOptional } from "class-validator";
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { IsMaritalStatus } from "./dataValidations/IsMaritalStatus";

@Entity()
export class Taxfile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    profile_id_fk: number;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({ type: "date", nullable: true })
    date_of_birth: Date;

    @Column()
    marital_status: string;

    @Column()
    street_name: string;

    @Column()
    city: string;

    @Column()
    province: string;

    @Column()
    postal_code: string;

    @Column()
    mobile_number: string;

    @Column()
    taxfile_province: string;

    @Column()
    moved_to_canada: string;

    @Column()
    date_of_entry: string;

    @Column()
    direct_deposit_cra: string;

    @Column()
    document_direct_deposit_cra: string;

    @Column({ default: 'NEW_REQUEST' })
    file_status: string;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    file_status_updated_on: Date | null;

    @Column()
    file_status_updated_by: number;

    @Column()
    // @Matches(/^\d{4}$/, {
    //     message: 'Invalid Tax Year',
    // })
    tax_year: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @Column()
    added_by: number;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    updated_on: Date | null;

    @Column()
    updated_by: number;


    @Column()
    user_id: number;

    // @BeforeInsert()
    // @BeforeUpdate()
    // async validateBeforeSave() {
    //     this.validate();
    // }
}
