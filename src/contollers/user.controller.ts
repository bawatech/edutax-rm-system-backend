import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import { validate, validateOrReject, Contains, IsInt, Length, IsEmail, IsFQDN, IsDate, Min, Max } from 'class-validator';
import { Returns } from '../entites/Returns';
import { UserLog } from '../entites/UserLog';



export const createUser = async (req: Request, res: Response) => {
  // Get the user data from the request body
  const { name, email, password } = req.body;

  // Validate the user data (optional)

  // Create a new user instance
  const user = new User();
  user.email = email;

  // Save the user to the database using TypeORM
  try {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save(user);
    // Send a success response
    res.status(201).json({ message: 'User created', user });
  } catch (error) {
    // Handle errors and send an error response
    res.status(500).json({ message: 'Something went wrong', error });
  }
};



export const profile = async (req: Request, res: Response) => {
  const { token, firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number } = req.body;

 // console.log("nnnnn",req.body)

  try {
    // Check if token is provided
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Find the active user log entry matching the token
    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { ulog_key: token, ulog_id_status: 'ACT' } });
    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    // Get the user ID from the active user log entry
    const userId = userLog.ulog_user_id_fk;


    // Validate date_of_birth format before conversion
    const dateOfBirthRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateOfBirthRegex.test(date_of_birth)) {
      return res.status(400).json({ message: 'Date of birth must be in YYYY-MM-DD format' });
    }

    // Convert date_of_birth string to Date object
    const dobDate = new Date(date_of_birth);

    // Create a new instance of Returns entity
    const returns = new Returns();
    returns.firstname = firstname;
    returns.lastname = lastname;
    returns.date_of_birth = dobDate;
    returns.marital_status = marital_status;
    returns.street_name = street_name;
    returns.city = city;
    returns.province = province;
    returns.postal_code = postal_code;
    returns.mobile_number = mobile_number;
    returns.created_by = userId;

    // Validate the Returns object
    const returnErrors = await validate(returns);
    if (returnErrors.length > 0) {
      const errorMessages = returnErrors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();
      return res.status(400).json({ message: 'Invalid returns data', errors: errorMessages });
    }

    // Save the returns data to the database
    const returnsRepository = AppDataSource.getRepository(Returns);
    await returnsRepository.save(returns);

    // Send a success response
    res.status(201).json({ message: 'Profile created successfully', returns });
  } catch (error) {
    // Handle errors and send an error response
    console.error('Error during profile creation:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
