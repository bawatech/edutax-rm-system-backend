import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import { validate } from 'class-validator';
import { Taxfile } from '../entites/Taxfile';
import { UserLog } from '../entites/UserLog';



export const createUser = async (req: Request, res: Response) => {

  const { name, email, password } = req.body;

  const user = new User();
  user.email = email;

  try {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save(user);

    res.status(201).json({ message: 'User created', user });
  } catch (error) {

    res.status(400).json({ message: 'Something went wrong', error });
  }
};



export const addTaxfile = async (req: Request, res: Response) => {
  const { token, firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number } = req.body;

  // console.log("nnnnn",req.body)

  try {

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false } });
    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const userId = userLog.user_id_fk;



    const dobDate = new Date(date_of_birth);

    const taxfile = new Taxfile();
    taxfile.firstname = firstname;
    taxfile.lastname = lastname;
    taxfile.date_of_birth = dobDate;
    taxfile.marital_status = marital_status;
    taxfile.street_name = street_name;
    taxfile.city = city;
    taxfile.province = province;
    taxfile.postal_code = postal_code;
    taxfile.mobile_number = mobile_number;
    taxfile.created_by = userId;


    const returnErrors = await validate(taxfile);
    if (returnErrors.length > 0) {
      const errorMessages = returnErrors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();
      return res.status(400).json({ message: 'Invalid taxfile data', errors: errorMessages });
    }


    const returnsRepository = AppDataSource.getRepository(Taxfile);
    await returnsRepository.save(taxfile);

    res.status(201).json({ message: 'Profile created successfully', taxfile });
  } catch (error) {

    console.error('Error during taxfile creation:', error);
    res.status(400).json({ message: 'Something went wrong', error });
  }
};




export const updateTaxfile = async (req: Request, res: Response) => {
  const { id, token, firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false } });
    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const userId = userLog.user_id_fk;

    // Find the existing taxfile record by ID
    const returnsRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await returnsRepository.findOne({ where: { id: id } });
    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    // Update taxfile properties
    taxfile.firstname = firstname;
    taxfile.lastname = lastname;
    taxfile.date_of_birth = new Date(date_of_birth);
    taxfile.marital_status = marital_status;
    taxfile.street_name = street_name;
    taxfile.city = city;
    taxfile.province = province;
    taxfile.postal_code = postal_code;
    taxfile.mobile_number = mobile_number;
    taxfile.updated_by = userId;

    // Validate updated taxfile data
    const returnErrors = await validate(taxfile);
    if (returnErrors.length > 0) {
      const errorMessages = returnErrors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();
      return res.status(400).json({ message: 'Invalid taxfile data', errors: errorMessages });
    }

    // Save the updated taxfile record
    await returnsRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile updated successfully', taxfile });
  } catch (error) {
    console.error('Error during taxfile update:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
