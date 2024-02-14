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
        // Password length should be between 8 and 20 characters
        if (password.length < 8 || password.length > 20) {
            return false;
        }

        // Password should contain at least one numeric value
        if (!/\d/.test(password)) {
            return false;
        }

        // Password should contain at least one symbol from #,@,!,$,%,&
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
