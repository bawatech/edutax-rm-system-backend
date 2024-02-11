import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: "taxfile_status" })
export class TaxfileStatus {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "enum", enum: ["NEW_REQUEST", "NEEDS_RESUBMISSION", "RESUBMITTED", "IN_PROGRESS", "SIGNING_PENDING", "SIGNED", "PAYMENT_ASKED", "PAYMENT_DONE", "COMPLETED",] })
    code: string;

    @Column({ length: 255 })
    name: string;

}
