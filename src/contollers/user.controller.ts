import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import { validate } from 'class-validator';
import { Taxfile } from '../entites/Taxfile';
import { UserLog } from '../entites/UserLog';
import { Documents } from '../entites/Documents';
import fs from "fs";
import path from "path";
import { Messages } from '../entites/messages';
import { handleCatch, requestDataValidation, sendSuccess } from '../utils/responseHanlder';



export const createUser = async (req: Request, res: Response) => {

  const { name, email, password } = req.body;

  const user = new User();
  user.email = email;

  try {
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save(user);

    res.status(201).json({ message: 'User created', user });
  } catch (e) {
    return handleCatch(res, e);
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

    await requestDataValidation(taxfile)

    const returnsRepository = AppDataSource.getRepository(Taxfile);
    await returnsRepository.save(taxfile);

    res.status(201).json({ message: 'Profile created successfully', taxfile });
  } catch (e) {
    return handleCatch(res, e);
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

    await requestDataValidation(taxfile)

    await returnsRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile updated successfully', taxfile });
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const uploadDocuments = async (req: Request, res: Response) => {

  try {
    const { taxfileId, documents } = req.body;

    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    if (!taxfileId) {
      return res.status(400).json({ message: 'Taxfile ID is required' });
    }
    if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
      return res.status(400).json({ message: 'Files are required' });
    }

    const documentRepository = AppDataSource.getRepository(Documents);


    for (let i = 0; i < documents.length; i++) {
      const file = files[i];
      const typeId = documents[i]['typeid'];
      const document = new Documents();
      document.taxfile_id_fk = taxfileId;
      document.type_id_fk = typeId;
      let file_name = file.originalname;
      document.filename = file_name;

      const saveDocument = await documentRepository.save(document);
      if (!saveDocument) {
        fs.unlinkSync(path.join(__dirname, '..', 'uploads', file_name));
      }
    }

    res.status(201).json({ message: 'Documents added successfully' });
  } catch (error) {
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    for (const file of files) {
      fs.unlinkSync(path.join(__dirname, '..', 'uploads', file.originalname));
    }

    console.error('Error during taxfiles addition:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};


export const addClientMessage = async (req: Request, res: Response) => {
  const { token, message, taxfile_id } = req.body;
  try {

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });
    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const userId = userLog.user_id_fk;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, created_by: userId } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found or not associated with the user' });
    }

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.taxfile_id_fk = taxfile_id;
    msgTab.message = message;
    msgTab.category = "GENERAL";
    msgTab.user_type = "CLIENT";
    msgTab.added_by = userId;

    await requestDataValidation(msgTab);

    await msgRepo.save(msgTab);
    return sendSuccess(res, "Message Added Successfully", { msgTab }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getClientMessages = async (req: Request, res: Response) => {
  const { token, taxfile_id } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });

    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const userId = userLog.user_id_fk;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, created_by: userId } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found or not associated with the user' });
    }

    const messageRepository = AppDataSource.getRepository(Messages);
    const messages = await messageRepository.find({
      where: { taxfile_id_fk: taxfile_id }
    });

    // // Get repository for Messages
    // const messageRepository = AppDataSource.getRepository(Messages);
    // const messages = await messageRepository.createQueryBuilder('message')
    //   .leftJoinAndSelect('message.executive', 'executive', 'message.user_type = :user_type AND message.added_by = executive.id', { user_type: 'EXECUTIVE' })
    //   .addSelect('executive.email')
    //   .where('message.taxfile_id_fk = :taxfileId', { taxfileId: taxfile_id })
    //   .getMany();

    return sendSuccess(res, "Messages Fetched Successfully", { messages }, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};
