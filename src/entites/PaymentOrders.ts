import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'payment_orders'})
export class PaymentOrder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    taxfile_id: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: string; 

    
    @Column({ nullable: true, type: "text" })
    title: string;

    @Column({type:'enum', enum:['Pending','Paid','Cancelled','Declined','Verified']})
    payment_status:string

    @Column({ nullable: true, type: "text" })
    payment_intent_id: string;

    @Column({ nullable: true, type: "text" })
    session_id: string;

    @Column({ nullable: true, type: "text" })
    payment_url: string;

    @Column({ type: "timestamp", nullable: true })
    payment_status_updated_on: Date;

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


}
