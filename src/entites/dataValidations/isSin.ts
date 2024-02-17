// import {
//     registerDecorator,
//     ValidationOptions,
//     ValidatorConstraint,
//     ValidatorConstraintInterface,
//     ValidationArguments,
// } from 'class-validator';

// @ValidatorConstraint({ async: false })
// export class IsSinConstraint implements ValidatorConstraintInterface {
//     validate(sinNumber: any) {

//         if (sinNumber?.length != 9) {
//             return "SIN should be of 9 digits"
//         }

//         var sinPattern = /^[0-9]{9}$/;
//         if (!sinPattern?.test(sinNumber)) {
//             return "SIN should be numerical"
//         }

//         const checkSIN = sinNumber?.split("")?.slice(0, 8)?.map((itm, index) => { return Number(itm * ((index + 1) % 2 == 0 ? 2 : 1)) })
//         const sinArrayIntoSingle = checkSIN?.map((itm) => toSingleDigit(itm));
//         const addingSIN = sinArrayIntoSingle?.reduce((sum, itm) => sum + itm, 0);
//         const dividingSIN = (10 - (addingSIN % 10))
//         const lastDigitArray = sinNumber?.split("")?.pop()

//         if (lastDigitArray != dividingSIN) {
//             return "Please enter a valid SIN number";
//         }

//         return true;
//     }

//     defaultMessage(args: ValidationArguments) {
//         return 'Incorrect Sin Number';
//     }
// }

// export function IsSin(validationOptions?: ValidationOptions) {
//     return function (object: Object, propertyName: string) {
//         registerDecorator({
//             target: object.constructor,
//             propertyName: propertyName,
//             options: validationOptions,
//             constraints: [],
//             validator: IsSinConstraint,
//         });
//     };
// }
