import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, UpdateDateColumn } from "typeorm";
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

    @Column({ default: 'NEW_REQUEST' })
    status: string;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    status_updated_on: Date | null;

    @Column()
    status_updated_by: number;


    @Column({ type: "int" })
    tax_year: number;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_on: Date;

    @Column()
    created_by: number;

    @UpdateDateColumn({ type: "timestamp", nullable: true, default: () => null })
    updated_on: Date | null;

    @Column()
    updated_by: number;

    validate() {
        console.log('Validating Taxfile entity...');
        const errors: { property: string, message: string }[] = [];

        //for mobile number
        if (this.mobile_number && !isValidPhoneNumber(this.mobile_number, 'CA')) {
            errors.push({ property: 'mobile_number', message: 'Mobile number must be valid for Canada' });
        }

        //for tax_year
        if (typeof this.tax_year === 'string') {
            const parsedYear = parseInt(this.tax_year);
            if (isNaN(parsedYear) || parsedYear < 1000 || parsedYear > 9999) {
                errors.push({ property: 'tax_year', message: 'Year must be a four-digit number' });
            }
        } else if (!Number.isInteger(this.tax_year) || this.tax_year < 1000 || this.tax_year > 9999) {
            errors.push({ property: 'tax_year', message: 'Year must be a four-digit number' });
        }

        //for date_of_birth
        if (typeof this.date_of_birth === 'string') {
            const parsedDate = new Date(this.date_of_birth);
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(this.date_of_birth) || isNaN(parsedDate.getTime())) {
                errors.push({ property: 'date_of_birth', message: 'Date of birth must be in YYYY-MM-DD format' });
            }
        } else if (!this.date_of_birth || isNaN(this.date_of_birth.getTime())) {
            errors.push({ property: 'date_of_birth', message: 'Date of birth must be a valid Date object' });
        }

        if (errors.length > 0) {
            console.log('Validation errors:', errors);
            throw new Error(errors.map(error => `${error.property}: ${error.message}`).join('\n'));
        }
    }


    // @BeforeInsert()
    // @BeforeUpdate()
    // async validateBeforeSave() {
    //     this.validate();
    // }
}
