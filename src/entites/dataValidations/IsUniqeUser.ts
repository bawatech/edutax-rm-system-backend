import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
import { User } from '../User';
import { AppDataSource } from '../../AppDataSource';
  
  @ValidatorConstraint({ async: true })
  export class IsUniqueUserConstraint implements ValidatorConstraintInterface {
   async validate(userEmail: any, args: ValidationArguments) {
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({ where: { email: userEmail } });
        if (existingUser) return false;
        return true;
    }
    defaultMessage(args: ValidationArguments) {
      return '$value is already in use';
    }
  }
  
  export function IsUniqueUser(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [],
        validator: IsUniqueUserConstraint,
      });
    };
  }