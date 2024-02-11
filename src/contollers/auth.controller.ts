import { Request, Response } from 'express';
import { User } from '../entites/User';
import { UserLog } from '../entites/UserLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { validate, validateOrReject, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max } from 'class-validator';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = new User();
  user.email = email;
  user.password = password;

  try {
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


    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { email: user.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }


    await userRepository.save(user);

    res.status(201).json({ message: 'Signed up successfully', user });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(400).json({ message: 'Something went wrong', error });
  }
};




export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }


    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const token = uuidv4();

    const userLog = new UserLog();
    userLog.ulog_user_id_fk = user.id;
    userLog.ulog_key = token;
    //userLog.ulog_privs = 'ADMIN';
    userLog.ulog_id_status = 'ACT';

    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ message: 'Something went wrong', error });
  }
};