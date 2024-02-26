import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const fieldErrors: { [key: string]: string } = {};
    errors.array().forEach((error: any) => {
      if (error.path) {
        fieldErrors[error.path] = error.msg;
      }
    });
    return res.status(400).json({ message:"Invalid/Missing data found",field_errors: fieldErrors });

    // return res.status(400).json({ errors: errors.array() });
  };
};

