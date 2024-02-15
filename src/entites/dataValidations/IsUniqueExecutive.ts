import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AppDataSource } from '../../AppDataSource';
import { Executive } from '../Executive';

@ValidatorConstraint({ async: true })
export class IsUniqueExecutiveConstraint implements ValidatorConstraintInterface {
  async validate(execEmail: any, args: ValidationArguments) {
    const execRepository = AppDataSource.getRepository(Executive);
    const existingExec = await execRepository.findOne({ where: { email: execEmail, id_status: "ACTIVE", is_deleted: false } });
    if (existingExec) return false;
    return true;
  }
  defaultMessage(args: ValidationArguments) {
    return '$value is already in use';
  }
}

export function IsUniqueExecutive(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueExecutiveConstraint,
    });
  };
}