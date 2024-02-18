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
import { FindOneOptions, Not } from 'typeorm';
import { MaritalStatus } from '../entites/MaritalStatus';
import { Provinces } from '../entites/Provinces';
import { DocumentTypes } from '../entites/DocumentTypes';
import { sendEmail } from '../utils/sendMail';
import { v4 as uuidv4 } from 'uuid';




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


export const updateProfile = async (req: Request, res: Response) => {
  const { firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number } = req.body;

  try {
    const userId = req?.userId;
    //const dobDate = new Date(date_of_birth);
    const userRepo = AppDataSource.getRepository(User)
    const profileRepo = AppDataSource.getRepository(Profile)
    const user = await userRepo.findOne({ where: { id: userId} });
    let profile = await profileRepo.findOne({where:{user:{id:user?.id}}});

    if(!profile){
      profile = new Profile();
    }

    profile.firstname = firstname;
    profile.lastname = lastname;
    profile.date_of_birth = date_of_birth;
    profile.marital_status = marital_status;
    profile.street_name = street_name;
    profile.city = city;
    profile.province = province;
    profile.postal_code = postal_code;
    profile.mobile_number = mobile_number?.replace(/\D/g, '')?.slice(-10);
    profile.added_by = userId;
    profile.added_by = userId;
    profile.user = user!;

    await requestDataValidation(profile)

    await profileRepo.save(profile);

    res.status(201).json({ message: 'Profile Created successfully', profile });
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const getProfile = async (req: Request, res: Response) => {

  try {
    const userId = req?.userId;
    const profileRepo = AppDataSource.getRepository(Profile)
    let profile = await profileRepo.findOne({where:{user:{id:userId}}});
      sendSuccess(res,"Success",{profile})


  } catch (e) {
    return handleCatch(res, e);
  }
};


export const addTaxfile = async (req: Request, res: Response) => {
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra } = req.body;

  // Handle array of files
  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;

  try {
    const userId = req?.userId;

    const profileRepo = AppDataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({
      where: { added_by: userId },
      order: { added_on: 'DESC' } as FindOneOptions['order']
    });
    if (!profile) {
      return sendError(res, "Profile Not Found");
    }

    const taxfile = new Taxfile();
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
    taxfile.document_direct_deposit_cra = singleFile?.filename ?? ''; //the expression evaluates to '' (an empty string)
    taxfile.added_by = userId;

    await requestDataValidation(taxfile)

    if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
      return res.status(400).json({ message: 'Files are required' });
    }

    const returnsRepository = AppDataSource.getRepository(Taxfile);
    const savedTaxfile = await returnsRepository.save(taxfile);

    if (!savedTaxfile) {
      for (const file of files) {
        let filepathfull = null;
        if (file.filename) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }
      }

      let singleFileFullPath = null;
      if (singleFile?.filename) {
        singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
        if (singleFileFullPath != null) {
          fs.unlinkSync(singleFileFullPath);
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
      let file_name = file.filename;
      document.filename = file_name;
      const saveDocument = await documentRepository.save(document);
      if (!saveDocument) {
        let filepathfull = null;
        if (file.filename) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }

        let singleFileFullPath = null;
        if (singleFile?.filename) {
          singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
          if (singleFileFullPath != null) {
            fs.unlinkSync(singleFileFullPath);
          }
        }
      }

    }
    //documents - end here

    res.status(201).json({ message: 'Taxfile Created successfully', taxfile });
  } catch (e) {

    for (const file of files) {
      let filepathfull = null;
      if (file.filename) {
        filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
        if (filepathfull != null) {
          fs.unlinkSync(filepathfull);
        }
      }
    }

    let singleFileFullPath = null;
    if (singleFile?.filename) {
      singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
      if (singleFileFullPath != null) {
        fs.unlinkSync(singleFileFullPath);
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
//         if (file.filename) {
//           filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
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
//       let file_name = file.filename;
//       document.filename = file_name;
//       const saveDocument = await documentRepository.save(document);
//       if (!saveDocument) {
//         let filepathfull = null;
//         if (file.filename) {
//           filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
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
//       if (file.filename) {
//         filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
//         if (filepathfull != null) {
//           fs.unlinkSync(filepathfull);
//         }
//       }

//     }
//     return handleCatch(res, e);
//   }
// };




export const updateTaxfile = async (req: Request, res: Response) => {
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra, taxfile_id } = req.body;

  // Handle array of files
  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;

  try {
    const userId = req?.userId;

    const taxfileRepo = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepo.findOne({ where: { added_by: userId, id: taxfile_id } });
    if (!taxfile) {
      return sendError(res, "Taxfile Not Found");
    }

    taxfile.tax_year = tax_year;
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    taxfile.date_of_entry = date_of_entry;
    taxfile.direct_deposit_cra = direct_deposit_cra;
    taxfile.document_direct_deposit_cra = singleFile?.filename ?? ''; //the expression evaluates to '' (an empty string)
    taxfile.added_by = userId;

    await requestDataValidation(taxfile)

    if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
      return res.status(400).json({ message: 'Files are required' });
    }

    const savedTaxfile = await taxfileRepo.update(taxfile.id, taxfile);

    if (!savedTaxfile) {
      for (const file of files) {
        let filepathfull = null;
        if (file.filename) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }
      }

      let singleFileFullPath = null;
      if (singleFile?.filename) {
        singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
        if (singleFileFullPath != null) {
          fs.unlinkSync(singleFileFullPath);
        }
      }
      return sendError(res, "Data Not Updated");
    }

    //documents - start here
    const documentRepository = AppDataSource.getRepository(Documents);
    await documentRepository
      .createQueryBuilder()
      .update(Documents)
      .set({ is_deleted: true })
      .where('taxfile_id_fk = :taxfileId', { taxfileId: taxfile_id })
      .andWhere('user_id_fk = :userId', { userId: userId })
      .execute();


    for (let i = 0; i < documents.length; i++) {
      const file = files[i];
      const typeId = documents[i]['typeid'];
      const document = new Documents();
      document.taxfile_id_fk = taxfile_id;
      document.user_id_fk = userId;
      document.type_id_fk = typeId;
      let file_name = file.filename;
      document.filename = file_name;
      const saveDocument = await documentRepository.save(document);
      if (!saveDocument) {
        let filepathfull = null;
        if (file.filename) {
          filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
          if (filepathfull != null) {
            fs.unlinkSync(filepathfull);
          }
        }

        let singleFileFullPath = null;
        if (singleFile?.filename) {
          singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
          if (singleFileFullPath != null) {
            fs.unlinkSync(singleFileFullPath);
          }
        }
      }
    }
    //documents - end here

    res.status(201).json({ message: 'Taxfile Updated successfully', taxfile });
  } catch (e) {

    for (const file of files) {
      let filepathfull = null;
      if (file.filename) {
        filepathfull = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
        if (filepathfull != null) {
          fs.unlinkSync(filepathfull);
        }
      }
    }

    let singleFileFullPath = null;
    if (singleFile?.filename) {
      singleFileFullPath = path.join(__dirname, '..', '..', 'storage', 'documents', singleFile.filename);
      if (singleFileFullPath != null) {
        fs.unlinkSync(singleFileFullPath);
      }
    }

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

    const base_url = process.env.BASE_URL;

    const taxfileMod = { ...taxfile[0], document_direct_deposit_cra: `${base_url}/storage/documents/${taxfile[0].document_direct_deposit_cra}` }
    // const uploadDir = path.join(__dirname, '..', '..', 'storage', 'documents');

    // const documentsWithPath = documents.map(doc => ({
    //   ...doc,
    //   full_path: path.join(uploadDir, doc.filename)
    // }));
    const documentsWithPath = documents.map(doc => ({
      ...doc,
      full_path: `${base_url}/storage/documents/${doc.filename}`
    }));

    taxfileMod.documents = documentsWithPath;
    console.log("taxfileModtaxfileMod", taxfileMod)
    res.status(200).json({ message: 'Success', taxfile: taxfileMod });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const taxFileList = async (req: Request, res: Response) => {

  try {
    const id = parseInt(req?.params?.id)
    const userId = req?.userId;
    // console.log("iiiiiiiiiiiiiiiiiiiiiiii",id)
    // console.log("userIduserId",userId)
    const taxRepo = AppDataSource.getRepository(Taxfile);
    const taxfiles = await taxRepo.find();

    if (!taxfiles) {
      return sendError(res,"No record found")
    }

    res.status(200).json({ message: 'Success', taxfiles });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const addClientMessage = async (req: Request, res: Response) => {
  const { message, taxfile_id } = req.body;
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
  // const { } = req.body;
  try {

    const taxfile_id = parseInt(req?.params?.id)

    const userId = req?.userId;
    // if (!token) {
    //   return res.status(400).json({ message: 'Token is required' });
    // }

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




////////////////////////
//ROUTES FOR MASTERS //START HERE
////////////////////////

export const getMaritalStatus = async (req: Request, res: Response) => {
  try {
    const maritalStatusRepo = AppDataSource.getRepository(MaritalStatus);
    const maritalStatusList = await maritalStatusRepo.find();

    return sendSuccess(res, "Marital Status Fetched Successfully", { maritalStatusList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const getProvinces = async (req: Request, res: Response) => {
  try {
    const provincesRepo = AppDataSource.getRepository(Provinces);
    const provincesList = await provincesRepo.find();

    return sendSuccess(res, "Provinces Fetched Successfully", { provincesList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getDocumentTypes = async (req: Request, res: Response) => {
  try {
    const documentTypesRepo = AppDataSource.getRepository(DocumentTypes);
    const documentTypesList = await documentTypesRepo.find();

    return sendSuccess(res, "Document Types Fetched Successfully", { documentTypesList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const sendSpouseInvitation = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userId = req?.userId;
  try {

    const spouseRepo = AppDataSource.getRepository(User);
    const existingSpouse = await spouseRepo.findOne({ where: { email: email, verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: Not(userId), spouse_invite_status: "PENDING" } });
    if (!existingSpouse) {
      return sendError(res, "Spouse Not Found/Verification Pending/Already Linked");
    };

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: userId, spouse_invite_status: "PENDING" } });
    if (!existingUser) {
      return sendError(res, "Verification Pending/Id Inactive/Already Linked to Spouse");
    };

    const spouse_id = existingSpouse.id;
    const spouse_email = existingSpouse.email;

    // const spouseProfileRepo = AppDataSource.getRepository(Profile);
    // const spouseProfile = await spouseProfileRepo.findOne({
    //   where: { added_by: spouse_id },
    //   order: { added_on: 'DESC' } as FindOneOptions['order']
    // });
    // if (!spouseProfile) {
    //   return sendError(res, "The Spouse Profile Not Exists");
    // };

    // const userProfileRepo = AppDataSource.getRepository(Profile);
    // const userProfile = await userProfileRepo.findOne({
    //   where: { added_by: userId },
    //   order: { added_on: 'DESC' } as FindOneOptions['order']
    // });
    // if (!userProfile) {
    //   return sendError(res, "Please add your Profile");
    // };

    const token = geenrateToken();
    const base_url = process.env.BASE_URL;
    const invitationLink = `${base_url}/user/accept-invitation/${token}`;

    const subject = "Edutax: Spousal Invitation";
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const message = "<h1>Please Click on the below link to ACCEPT the Spousal Invitation</h1><br><br>Click on the given link : " + invitationLink;
    await sendEmail(email, subject, message);

    existingUser.spouse_invite_token = token;
    existingUser.spouse_email = spouse_email;
    existingUser.spouse_id = spouse_id;

    await userRepo.update(existingUser.id, existingUser);

    return sendSuccess(res, "Invitation Sent successfully.", {}, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const acceptSpouseInvitation = async (req: Request, res: Response) => {
  const token = req?.params?.token
  try {

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, spouse_invite_status: "PENDING", spouse_invite_token: token } });
    if (!existingUser) {
      return sendError(res, "Verification Pending/Id Inactive/Already Linked to Spouse");
    };

    const spouse_id = existingUser.spouse_id;
    const spouse_email = existingUser.spouse_email;
    const inviteToken = existingUser.spouse_invite_token;

    const user_id = existingUser.id;
    const user_email = existingUser.email;

    if (inviteToken != token) {
      return sendError(res, "Expired/Wrong Invitation Token");
    }

    const spouseRepo = AppDataSource.getRepository(User);
    const existingSpouse = await spouseRepo.findOne({ where: { email: spouse_email, verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: spouse_id, spouse_invite_status: "PENDING" } });
    if (!existingSpouse) {
      return sendError(res, "Spouse Not Found/Verification Pending/Already Linked");
    };

    existingUser.spouse_invite_status = "ACCEPTED";
    await userRepo.update(existingUser.id, existingUser);

    existingSpouse.spouse_email = user_email;
    existingSpouse.spouse_id = user_id;
    existingSpouse.spouse_invite_status = "ACCEPTED";
    await spouseRepo.update(existingSpouse.id, existingSpouse);

    return sendSuccess(res, "Spouse Linked successfully.", {}, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};








const geenrateToken = () => {
  return uuidv4();
}
