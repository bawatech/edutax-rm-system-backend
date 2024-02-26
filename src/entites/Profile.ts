import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, OneToMany, AfterLoad } from "typeorm";
import { IsAlphanumeric, IsPostalCode, Matches, MaxLength, IsOptional } from "class-validator";
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { IsMaritalStatus } from "./dataValidations/IsMaritalStatus";
import { User } from "./User";
import { IsSin } from "./dataValidations/isSin";
import { MaritalStatus } from "./MaritalStatus";
import { Provinces } from "./Provinces";
import { Taxfile } from "./Taxfile";
import { dec, enc } from "../utils/commonFunctions";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    // @IsOptional()
    // @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    firstname: string;

    @Column()
    // @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    lastname: string;

    @Column({ type: "date" })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'The date must be in the correct format',
    })
    date_of_birth: Date;

    @Column()
    @IsSin()
    sin: string;

    @Column({ nullable: true })
    street_number: string;

    @Column()
    // @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    street_name: string;

    @Column()
    // @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    city: string;

    @Column()
    // @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    province: string;

    @Column()
    @IsPostalCode("CA", { message: 'Invalid Postal code' })
    postal_code: string;

    @Column({ type: "text" })
    @Matches(/^(\+?1\s?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, { //This expression allows for various formats, including with or without the country code, with or without parentheses, and with or without separators such as hyphens or spaces.
        message: 'Invalid Canadian mobile number'
    })
    mobile_number: string | undefined;

    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    mob_last_digits: number;

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

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User


    @Column()
    @IsMaritalStatus()
    marital_status: string;

    @ManyToOne(() => MaritalStatus, (marital_status) => marital_status.profiles)
    @JoinColumn({ name: 'marital_status' })
    marital_status_detail: MaritalStatus

    @ManyToOne(() => Provinces, (province) => province.profiles)
    @JoinColumn({ name: 'province' })
    province_detail: Provinces

    // @OneToMany(() => Taxfile, (taxfile) => taxfile.profile_detail)
    // taxfiles: Taxfile[]

    // get _mobile_number(): any | undefined {
    //     return dec(this.mobile_number);
    // }

    @BeforeInsert()
    encodeMobile() {
        this.mobile_number = enc(this.mobile_number);
    }

    @AfterLoad()
    decodeMobile() {
        this.mobile_number = dec(this.mobile_number);
    }


}
