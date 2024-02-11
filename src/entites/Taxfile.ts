import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";
import { Length, IsDate, IsInt, IsAlphanumeric, IsPostalCode, ValidateIf, Matches } from "class-validator";
import { isValidPhoneNumber } from 'libphonenumber-js';

@Entity()
export class Taxfile {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 100 })
    @Length(1, 100)
    firstname: string;

    @Column({ length: 100 })
    @Length(1, 100)
    lastname: string;

    @Column({ type: "date" })
    @IsDate({ message: 'Date of birth must be in YYYY-MM-DD format' })
    date_of_birth: Date;

    @Column()
    marital_status: number;

    @Column({ length: 255 })
    @Matches(/^[a-zA-Z0-9\s#\-,.']*$/, { message: 'Street name can only contain letters, numbers, spaces, "#", "-", ",", and "\'"' })
    street_name: string; 

    @Column({ length: 100 })
    @Length(1, 100)
    city: string;

    @Column({ length: 100 })
    @Length(1, 100)
    province: string;

    @Column({ length: 10 })
    @IsPostalCode("CA", { message: 'Postal code must be valid' })
    postal_code: string;

    @Column({ length: 15 })
    @ValidateIf(obj => obj.mobile_number !== '')
    mobile_number: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column()
    created_by: number;

    validate() {
        if (this.mobile_number && !isValidPhoneNumber(this.mobile_number, 'CA')) {
            throw new Error('Mobile number must be valid for Canada');
        }
    }
}
