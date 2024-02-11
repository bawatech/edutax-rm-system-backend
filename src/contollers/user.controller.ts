import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import { validate } from 'class-validator';
import { Taxfile } from '../entites/Taxfile';
import { UserLog } from '../entites/UserLog';
import { Documents } from '../entites/Documents';
import fs from "fs";
import path from "path";



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


// export const uploadDocuments = async (req: Request, res: Response) => {
//   try {
//     const { taxfileId,typeIds } = req.body; // Assuming you receive the taxfile ID in the request body
//     const files = req.files as Express.Multer.File[];

//     if (!taxfileId || !typeIds || typeIds.length !== files.length || files.length === 0) {
//       return res.status(400).json({ message: 'Taxfile ID, type IDs, and files are required' });
//     }

//     const documentRepository = AppDataSource.getRepository(Documents);

//     // // Iterate over each file and save it to the database
//     // for (const file of files) {
//     //   const document = new Documents();
//     //   document.taxfile_id_fk = taxfileId;
//     //   document.filename = file.originalname;
//     //   await documentRepository.save(document);
//     // }
//     // Iterate over each file and save it to the database
//     for (let i = 0; i < files.length; i++) {
//       const file = files[i];
//       const typeId = typeIds[i];
//       const document = new Documents();
//       document.taxfile_id_fk = taxfileId;
//       document.type_id_fk = typeId; // Set the type ID for the document
//       document.filename = file.originalname;
//       await documentRepository.save(document);
//     }

//     res.status(201).json({ message: 'Documents added successfully' });
//   } catch (error) {

//     // If an error occurs during database operations, delete uploaded files
//     const files = req.files as Express.Multer.File[];
//     for (const file of files) {
//       fs.unlinkSync(path.join(__dirname, '..', 'uploads', file.filename));
//     }

//     console.error('Error during taxfiles addition:', error);
//     res.status(500).json({ message: 'Something went wrong', error });

//   }
// };

export const uploadDocuments = async (req: Request, res: Response) => {
  console.log("rrrrrrr",req.body);

  try {
    const { taxfileId } = req.body;
    for (let i = 0; i < req.body.documents.length; i++) {
      console.log("mmmmmmmmmmmm",req.body.documents[i]['typeid'])
    }
   
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const typeIds: number[] = req.body.typeIds;

    // if (!taxfileId || !files || !typeIds || files.length !== typeIds.length || files.length === 0) {
    //   return res.status(400).json({ message: 'Taxfile ID, type IDs, and files are required' });
    // }

    const documentRepository = AppDataSource.getRepository(Documents);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const typeId = typeIds[i];

      const document = new Documents();
      document.taxfile_id_fk = taxfileId;
      document.type_id_fk = typeId;
      document.filename = file.originalname;

      await documentRepository.save(document);
    }

    res.status(201).json({ message: 'Documents added successfully' });
  } catch (error) {
    // If an error occurs during database operations, delete uploaded files
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    for (const file of files) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', file.filename));
    }

    console.error('Error during taxfiles addition:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};
