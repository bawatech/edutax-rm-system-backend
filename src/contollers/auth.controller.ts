import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import {
  validate,
  validateOrReject,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
} from 'class-validator';

export const signUp = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    // Validate the user data (optional)
  
    const user = new User();
    user.email = email;
    user.password = password;

    validate(user).then(errors => {
      // errors is an array of validation errors
      if (errors.length > 0) {
        console.log('validation failed. errors: ', errors);
      } else {
        console.log('validation succeed');
      }
    });

    validateOrReject(user).catch(errors => {
      console.log('Promise rejected (validation failed). Errors: ', errors);
    });
  
    // Save the user to the database using TypeORM
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save(user);
      // Send a success response
      res.status(201).json({ message: 'Signed up successfully', user });
    } catch (error) {
      // Handle errors and send an error response
      res.status(500).json({ message: 'Something went wrong', error });
    }
  };
  



  export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
  
    // Validate the user data (optional)
  
    const user = new User();
    user.email = email;
    user.password = password;
  
    // Save the user to the database using TypeORM
    try {
      const userRepository = AppDataSource.getRepository(User);
      await userRepository.save(user);
      // Send a success response
      res.status(201).json({ message: 'Logged in successfully', user });
    } catch (error) {
      // Handle errors and send an error response
      res.status(500).json({ message: 'Something went wrong', error });
    }
  };