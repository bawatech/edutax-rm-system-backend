import { validate } from './validator';
import { body } from 'express-validator';

const required = 'Required Field';
const InvalidFormat = 'Invalid Format';

export const validateLogin = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('password').notEmpty().withMessage(required),
]);


export const validateSignup = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('password').notEmpty().withMessage(required),
]);

export const validateVerifyLogin = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').notEmpty().withMessage(required),
]);

export const validateVerifyEmail = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').notEmpty().withMessage(required),
]);

export const validateForgotPass = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat)
]);

export const validateNewPass = validate([
    body('email')
        .notEmpty().withMessage(required).bail()
        .isEmail().withMessage(InvalidFormat),
    body('otp').notEmpty().withMessage(required),
    body('password').notEmpty().withMessage(required),
]);


export const validateUpdatePass = validate([
    body('newPassword')
        .notEmpty().withMessage(required).bail()
]);