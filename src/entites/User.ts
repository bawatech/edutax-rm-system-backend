import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IsEmail } from "class-validator";

@Entity()
export class  User{
@PrimaryGeneratedColumn()
id: number

@Column()
password:string

@Column()
@IsEmail()
email:string;

@Column()
age:number;
}