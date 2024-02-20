import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
    validate(password: any) {
        
        if (password.length < 8 || password.length > 20) {
            return false;
        }

       
        if (!/\d/.test(password)) {
            return false;
        }

        
        if (!/[#@!$%&]/.test(password)) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&';
    }
}

export function IsStrongPassword(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsStrongPasswordConstraint,
        });
    };
}
