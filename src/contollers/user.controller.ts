import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
export const createUser = async (req: Request, res: Response) => {
    // Get the user data from the request body
    const { name, email, password } = req.body;
  
    // Validate the user data (optional)
  
    // Create a new user instance
    const user = new User();
    user.firstName = name;
    user.email = email;
    user.lastName = password;
  
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
  