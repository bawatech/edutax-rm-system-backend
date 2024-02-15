import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn } from "typeorm";
import { IsAlphanumeric, IsPostalCode, Matches, MaxLength, IsOptional } from "class-validator";
// import { isValidPhoneNumber } from 'libphonenumber-js';
import { IsMaritalStatus } from "./dataValidations/IsMaritalStatus";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    // @IsOptional()
    @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    firstname: string;

    @Column()
    @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    lastname: string;

    @Column({ type: "date", nullable: true })
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'The date must be in the correct format',
    })
    date_of_birth: Date;

    @Column()
    @IsMaritalStatus()
    marital_status: string;

    @Column()
    @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    street_name: string;

    @Column()
    @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    city: string;

    @Column({ length: 100 })
    @IsAlphanumeric()
    @MaxLength(100, { message: 'The value must be alphanumeric and have a maximum length of $constraint1 characters' })
    province: string;

    @Column()
    @IsPostalCode("CA", { message: 'Invalid Postal code' })
    postal_code: string;

    @Column()
    @Matches(/^(\+?1\s?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/, { //This expression allows for various formats, including with or without the country code, with or without parentheses, and with or without separators such as hyphens or spaces.
        message: 'Invalid Canadian mobile number'
    })
    mobile_number: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @Column()
    added_by: number;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    updated_on: Date | null;

    @Column()
    updated_by: number;

    // @BeforeInsert()
    // @BeforeUpdate()
    // async validateBeforeSave() {
    //     this.validate();
    // }
}
