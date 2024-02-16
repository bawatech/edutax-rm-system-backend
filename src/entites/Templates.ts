import { Length, MaxLength } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "templates" })
export class Templates {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Length(4, 10, { message: 'Code must be from 4 to 10 characters' })
    code: string;

    @Column()
    @Length(4, 50, { message: 'Title must be from 4 to 50 characters' })
    title: string;

    @Column({ type: "text" })
    @MaxLength(500, { message: 'Description must be at most 50 characters long' })
    description: string;

    @Column({ default: 'ACTIVE', type: 'enum', enum: ['ACTIVE', 'INACTIVE'] })
    id_status: string;

    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    added_on: Date;

    @Column()
    added_by: number;

}
