import { Request, Response } from 'express';
import { User } from '../entites/User';
import { AppDataSource } from '../AppDataSource';
import { Taxfile } from '../entites/Taxfile';
import { UserLog } from '../entites/UserLog';
import { Documents } from '../entites/Documents';
import fs from "fs";
import path from "path";
import { Messages } from '../entites/messages';
import { handleCatch, requestDataValidation, sendError, sendSuccess } from '../utils/responseHanlder';
import { Profile } from '../entites/Profile';
import { FindOneOptions } from 'typeorm';





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


export const createProfile = async (req: Request, res: Response) => {
  const { firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number } = req.body;

  try {
    const userId = req?.userId;
    //const dobDate = new Date(date_of_birth);

    const profile = new Profile();
    profile.firstname = firstname;
    profile.lastname = lastname;
    profile.date_of_birth = date_of_birth;
    profile.marital_status = marital_status;
    profile.street_name = street_name;
    profile.city = city;
    profile.province = province;
    profile.postal_code = postal_code;
    profile.mobile_number = mobile_number;
    profile.added_by = userId;

    await requestDataValidation(profile)

    const profileRepo = AppDataSource.getRepository(Profile);
    await profileRepo.save(profile);

    res.status(201).json({ message: 'Profile Created successfully', profile });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const addTaxfile = async (req: Request, res: Response) => {
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra } = req.body;

  try {
    const userId = req?.userId;

    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
      return res.status(400).json({ message: 'Files are required' });
    }

    const profileRepo = AppDataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({
      where: { added_by: userId },
      order: { added_on: 'DESC' } as FindOneOptions['order']
    });
    if (!profile) {
      return sendError(res, "Profile Not Found");
    }


    const taxfile = new Taxfile();
    console.log("profile.date_of_birth",profile.date_of_birth)
    taxfile.profile_id_fk = profile.id
    taxfile.firstname = profile.firstname;
    taxfile.lastname = profile.lastname;
    taxfile.date_of_birth = profile.date_of_birth;
    taxfile.marital_status = profile.marital_status;
    taxfile.street_name = profile.street_name;
    taxfile.city = profile.city;
    taxfile.province = profile.province;
    taxfile.postal_code = profile.postal_code;
    taxfile.mobile_number = profile.mobile_number;
    taxfile.tax_year = tax_year;
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    taxfile.date_of_entry = date_of_entry;
    taxfile.direct_deposit_cra = direct_deposit_cra;
    taxfile.document_direct_deposit_cra = document_direct_deposit_cra;
    taxfile.added_by = userId;

    await requestDataValidation(taxfile)

    const returnsRepository = AppDataSource.getRepository(Taxfile);
    const savedTaxfile = await returnsRepository.save(taxfile);

    if (!savedTaxfile) {
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      for (const file of files) {
        let filepathfull = null;
        if (file.originalname) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }
      }
      return sendError(res, "Data Not Saved");
    }
    const taxfileId = savedTaxfile.id;

    //documents - start here

    const documentRepository = AppDataSource.getRepository(Documents);
    for (let i = 0; i < documents.length; i++) {
      const file = files[i];
      const typeId = documents[i]['typeid'];
      const document = new Documents();
      document.taxfile_id_fk = taxfileId;
      document.user_id_fk = userId;
      document.type_id_fk = typeId;
      let file_name = file.originalname;
      document.filename = file_name;
      const saveDocument = await documentRepository.save(document);
      if (!saveDocument) {
        let filepathfull = null;
        if (file.originalname) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }
      }
    }
    //documents - end here

    res.status(201).json({ message: 'Taxfile Created successfully', taxfile });
  } catch (e) {
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];

    for (const file of files) {
      let filepathfull = null;
      if (file.originalname) {
        filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
        if (filepathfull != null) {
          fs.unlinkSync(filepathfull);
        }
      }

    }
    return handleCatch(res, e);
  }
};

// export const addTaxfile = async (req: Request, res: Response) => {
//   const { firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number, tax_year, documents } = req.body;

//   try {
//     const userId = req?.userId;

//     const files: Express.Multer.File[] = req.files as Express.Multer.File[];
//     if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
//       return res.status(400).json({ message: 'Files are required' });
//     }


//     const dobDate = new Date(date_of_birth);

//     const taxfile = new Taxfile();
//     taxfile.firstname = firstname;
//     taxfile.lastname = lastname;
//     taxfile.date_of_birth = date_of_birth;
//     taxfile.marital_status = marital_status;
//     taxfile.street_name = street_name;
//     taxfile.city = city;
//     taxfile.province = province;
//     taxfile.postal_code = postal_code;
//     taxfile.mobile_number = mobile_number;
//     taxfile.tax_year = tax_year;
//     taxfile.created_by = userId;

//     await requestDataValidation(taxfile)

//     const returnsRepository = AppDataSource.getRepository(Taxfile);
//     const savedTaxfile = await returnsRepository.save(taxfile);

//     if (!savedTaxfile) {
//       const files: Express.Multer.File[] = req.files as Express.Multer.File[];
//       for (const file of files) {
//         let filepathfull = null;
//         if (file.originalname) {
//           filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
//           if (filepathfull != null) {
//             fs.unlinkSync(filepathfull);
//           }
//         }
//       }
//       return sendError(res, "Data Not Saved");
//     }
//     const taxfileId = savedTaxfile.id;

//     //documents - start here

//     const documentRepository = AppDataSource.getRepository(Documents);
//     for (let i = 0; i < documents.length; i++) {
//       const file = files[i];
//       const typeId = documents[i]['typeid'];
//       const document = new Documents();
//       document.taxfile_id_fk = taxfileId;
//       document.user_id_fk = userId;
//       document.type_id_fk = typeId;
//       let file_name = file.originalname;
//       document.filename = file_name;
//       const saveDocument = await documentRepository.save(document);
//       if (!saveDocument) {
//         let filepathfull = null;
//         if (file.originalname) {
//           filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
//           if (filepathfull != null) {
//             fs.unlinkSync(filepathfull);
//           }
//         }
//       }
//     }
//     //documents - end here



//     res.status(201).json({ message: 'Taxfile Created successfully', taxfile });
//   } catch (e) {
//     const files: Express.Multer.File[] = req.files as Express.Multer.File[];

//     for (const file of files) {
//       let filepathfull = null;
//       if (file.originalname) {
//         filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.originalname);
//         if (filepathfull != null) {
//           fs.unlinkSync(filepathfull);
//         }
//       }

//     }
//     return handleCatch(res, e);
//   }
// };




export const updateTaxfile = async (req: Request, res: Response) => {
  const { id, token, firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number, tax_year } = req.body;

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

    const returnsRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await returnsRepository.findOne({ where: { id: id } });
    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    // Update taxfile properties
    taxfile.firstname = firstname;
    taxfile.lastname = lastname;
    taxfile.date_of_birth = date_of_birth;
    taxfile.marital_status = marital_status;
    taxfile.street_name = street_name;
    taxfile.city = city;
    taxfile.province = province;
    taxfile.postal_code = postal_code;
    taxfile.mobile_number = mobile_number;
    taxfile.tax_year = tax_year;
    taxfile.updated_by = userId;

    await requestDataValidation(taxfile)

    await returnsRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile updated successfully', taxfile });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const taxFileDetails = async (req: Request, res: Response) => {

  try {
    const id = parseInt(req?.params?.id)
    const userId = req?.userId;
    // console.log("iiiiiiiiiiiiiiiiiiiiiiii",id)
    // console.log("userIduserId",userId)
    const taxRepo = AppDataSource.getRepository(Taxfile);
    // const taxfile = await taxRepo.findOne({ where: { id: id, created_by: userId } });

    const taxfile = await taxRepo.query(
      `SELECT t.*, p.name AS province_name, m.name AS marital_status_name
       FROM taxfile t
       LEFT JOIN provinces p ON t.province = p.code
       LEFT JOIN marital_status m ON t.marital_status = m.code
       WHERE t.id = ? AND t.added_by = ?`,
      [id, userId]
    );

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }


    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id, user_id_fk: userId } });
    if (!documents) {
      return res.status(400).json({ message: 'Documents not found' });
    }

    // const uploadDir = path.join(__dirname, '..', '..', 'storage', 'documents');

    const base_url = process.env.BASE_URL;
    // const documentsWithPath = documents.map(doc => ({
    //   ...doc,
    //   full_path: path.join(uploadDir, doc.filename)
    // }));
    const documentsWithPath = documents.map(doc => ({
      ...doc,
      full_path: `${base_url}/storage/documents/${doc.filename}`
    }));

    taxfile[0].documents = documentsWithPath;

    res.status(200).json({ message: 'Success', taxfile: taxfile[0] });
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const addClientMessage = async (req: Request, res: Response) => {
  const { token, message, taxfile_id } = req.body;
  try {


    const userId = req?.userId;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, added_by: userId } });

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

    const taxfile_id = parseInt(req?.params?.id)

    const userId = req?.userId;
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // const userLogRepository = AppDataSource.getRepository(UserLog);
    // const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });
    // if (!userLog) {
    //   return res.status(400).json({ message: 'Invalid token or token expired' });
    // }
    // const userId = userLog.user_id_fk;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, added_by: userId } });

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
