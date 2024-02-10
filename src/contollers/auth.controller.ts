import { Request, Response } from 'express';
import { User } from '../entites/User';
import { UserLog } from '../entites/UserLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { validate, validateOrReject, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max } from 'class-validator';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Validate the user data
  const user = new User();
  user.email = email;
  user.password = password;

  try {
    // Validate email format and password length
    // const emailErrors = await validate(user, { skipMissingProperties: true });
    // if (emailErrors.length > 0) {
    //   const emailErrorMessages = emailErrors.map(error => error.constraints ? Object.values(error.constraints) : []).flat();
    //   return res.status(400).json({ message: 'Invalid email format', errors: emailErrorMessages });
    // }

    // Validate the User object
    const userErrors = await validate(user);
    if (userErrors.length > 0) {
      const errorMessages = userErrors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();
      return res.status(400).json({ message: 'Invalid user data', errors: errorMessages });
    }

    // Check password length
    if (password.length < 8 || password.length > 10) {
      return res.status(400).json({ message: 'Password must be between 8 and 10 characters long' });
    }

    // Check if email already exists
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email: user.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }


    // Save the user to the database
    await userRepository.save(user);

    // Send a success response
    res.status(201).json({ message: 'Signed up successfully', user });
  } catch (error) {
    // Handle errors and send an error response
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};




export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    // Check if the password matches
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate token with UUID
    const token = uuidv4();

    // Create a new UserLog entity
    const userLog = new UserLog();
    userLog.ulog_user_id_fk = user.id;
    userLog.ulog_key = token;
    //userLog.ulog_privs = 'ADMIN';
    userLog.ulog_id_status = 'ACT';

    // Save the user log to the database
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);

    // Send success response with token
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    // Handle errors and send an error response
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};