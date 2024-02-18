import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsSinConstraint implements ValidatorConstraintInterface {
    validate(sinNumber: any, args: ValidationArguments) {

        if (sinNumber?.length != 9) {
            return false;
        }

        var sinPattern = /^[0-9]{9}$/;
        if (!sinPattern?.test(sinNumber)) {
            return false;
        }

        const checkSIN = sinNumber?.split("")?.slice(0, 8)?.map((itm:any, index:any) => { return Number(itm * ((index + 1) % 2 == 0 ? 2 : 1)) })
        const sinArrayIntoSingle = checkSIN?.map((itm:any) => toSingleDigit(itm));
        const addingSIN = sinArrayIntoSingle?.reduce((sum:any, itm:any) => sum + itm, 0);
        const dividingSIN = (10 - (addingSIN % 10))
        const lastDigitArray = sinNumber?.split("")?.pop()

        if (lastDigitArray != dividingSIN) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Incorrect Sin Number';
    }
}

export function IsSin(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSinConstraint,
        });
    };
}


export const toSingleDigit = (number:number) => {
    while (number >= 10) {
      number = number
        .toString()
        .split('')
        .map(Number)
        .reduce((a, b) => a + b, 0);
    }
    return number;
  }