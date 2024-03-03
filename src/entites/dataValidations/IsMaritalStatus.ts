import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AppDataSource } from '../../AppDataSource';
import { MaritalStatus } from '../MaritalStatus';

@ValidatorConstraint({ async: true })
export class IsMaritalStatusConstraint implements ValidatorConstraintInterface {
  async validate(maritalStatus: any, args: ValidationArguments) {
    const maritalStatusRepo = AppDataSource.getRepository(MaritalStatus);
    const existingStatus = await maritalStatusRepo.findOne({ where: { code: maritalStatus } });
    if (existingStatus) return true;
    return false;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Wrong marital status';
  }
}

export function IsMaritalStatus(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMaritalStatusConstraint,
    });
  };
}