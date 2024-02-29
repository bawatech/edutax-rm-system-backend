import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { AppDataSource } from '../../AppDataSource';
import { Provinces } from '../Provinces';

@ValidatorConstraint({ async: true })
export class IsProvinceConstraint implements ValidatorConstraintInterface {
  async validate(province: any, args: ValidationArguments) {
    const provinceRepo = AppDataSource.getRepository(Provinces);
    const existingProvince = await provinceRepo.findOne({ where: { code: province } });
    if (existingProvince) return true;
    return false;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Wrong Province';
  }
}

export function IsProvince(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsProvinceConstraint,
    });
  };
}