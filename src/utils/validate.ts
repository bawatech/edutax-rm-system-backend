import { validate } from './validator';
import { body } from 'express-validator';

const required = 'Required Field';
const InvalidFormat = 'Invalid Format';

export const validateLogin = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('password').trim().notEmpty().withMessage(required),
]);


export const validateSignup = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('password').trim().notEmpty().withMessage(required),
]);

export const validateVerifyLogin = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').trim().notEmpty().withMessage(required),
]);

export const validateVerifyEmail = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').trim().notEmpty().withMessage(required),
]);

export const validateForgotPass = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat)
]);

export const validateNewPass = validate([
    body('email').trim()
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').trim().notEmpty().withMessage(required),
    body('newPassword').trim().notEmpty().withMessage(required),
]);


export const validateUpdatePass = validate([
    body('newPassword').trim()
        .notEmpty().withMessage(required).bail()
]);

export const validateUpdateProfile = validate([
    body('firstname').trim()
        .notEmpty().withMessage(required),
    body('lastname').trim()
        .notEmpty().withMessage(required),
    body('date_of_birth').trim()
        .notEmpty().withMessage(required),
    body('street_number').trim()
        .notEmpty().withMessage(required),
    body('street_name').trim()
        .notEmpty().withMessage(required),
    body('city').trim()
        .notEmpty().withMessage(required),
    body('province').trim()
        .notEmpty().withMessage(required),
    body('postal_code').trim()
        .notEmpty().withMessage(required),
    body('mobile_number').trim()
        .notEmpty().withMessage(required),
    body('marital_status').trim()
        .notEmpty().withMessage(required),
]);