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
  const { firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number, sin, street_number } = req.body;

  try {
    const userId = req?.userId;
    //const dobDate = new Date(date_of_birth);
    const userRepo = AppDataSource.getRepository(User)
    const profileRepo = AppDataSource.getRepository(Profile)
    const user = await userRepo.findOne({ where: { id: userId } });
    let profile = await profileRepo.findOne({ where: { user: { id: user?.id } } });

    if (!profile) {
      profile = new Profile();
      profile.added_by = userId;
      profile.added_on = new Date();
    }

    profile.firstname = firstname;
    profile.lastname = lastname;
    profile.date_of_birth = date_of_birth;
    profile.marital_status = marital_status;
    profile.street_number = street_number;
    profile.street_name = street_name;
    profile.city = city;
    profile.province = province;
    profile.postal_code = postal_code;
    profile.sin = sin;
    profile.mobile_number = mobile_number?.replace(/\D/g, '')?.slice(-10);
    profile.user = user!;
    profile.updated_on = new Date();
    profile.updated_by = userId;

    await requestDataValidation(profile)

    await profileRepo.save(profile);

    res.status(201).json({ message: 'Success', profile });
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const getProfile = async (req: Request, res: Response) => {

  try {
    const userId = req?.userId;
    const profileRepo = AppDataSource.getRepository(Profile)
    let profile = await profileRepo.findOne({ where: { user_id: userId }, relations: ['user', 'marital_status_detail', 'province_detail'] });
    sendSuccess(res, "Success", { profile })

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const addTaxfile = async (req: Request, res: Response) => {
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra } = req.body;


  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;

  try {
    const userId = req?.userId;
    const userRepo = AppDataSource.getRepository(User)
    const user = await userRepo.findOne({ where: { id: userId } });
    const profileRepo = AppDataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({
      where: { user: { id: user?.id } }
    });
    if (!profile) {
      unlinkMultiFiles(files);
      unlinkSingleFile(singleFile?.filename);
      return sendError(res, "Please update profile first");
    }

    const taxfile = new Taxfile();
    taxfile.profile_id_fk = profile.id
    taxfile.firstname = profile.firstname;
    taxfile.lastname = profile.lastname;
    taxfile.date_of_birth = profile.date_of_birth;
    taxfile.marital_status = profile.marital_status;
    taxfile.street_number = profile.street_number;
    taxfile.street_name = profile.street_name;
    taxfile.city = profile.city;
    taxfile.province = profile.province;
    taxfile.postal_code = profile.postal_code;
    taxfile.mobile_number = profile.mobile_number;
    taxfile.tax_year = '2022';
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    taxfile.date_of_entry = date_of_entry;
    taxfile.direct_deposit_cra = direct_deposit_cra;
    taxfile.document_direct_deposit_cra = singleFile?.filename ?? ''; //the expression evaluates to '' (an empty string)
    taxfile.added_by = userId;
    taxfile.added_on = new Date();
    taxfile.user_id = userId;

    await requestDataValidation(taxfile)

    if (!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) {
      return sendError(res, "Files are Required");
    }

    const returnsRepository = AppDataSource.getRepository(Taxfile);
    const savedTaxfile = await returnsRepository.save(taxfile);

    if (!savedTaxfile) {
      unlinkMultiFiles(files);
      unlinkSingleFile(singleFile?.filename);
      return sendError(res, "Taxfile Not Saved");
    }
    const taxfileId = savedTaxfile.id;

    //documents - start here
    const documentRepository = AppDataSource.getRepository(Documents);
    if (documents && Array.isArray(documents) && files && Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        if (documents[i]['typeid'] && documents[i]['typeid'] !== null && documents[i]['typeid'] !== undefined && documents[i]['typeid'] !== "") {
          const file = files[i];
          const typeId = documents[i]['typeid'];
          const documentTypeRepo = AppDataSource.getRepository(DocumentTypes);
          const documentType = await documentTypeRepo.findOne({ where: { id: typeId } });
          if (!documentType) {
            unlinkMultiFiles(files);
            unlinkSingleFile(singleFile?.filename);
            return sendError(res, "Invalid Document Type Id");
          }
          const document = new Documents();
          document.taxfile_id_fk = taxfileId;
          document.user_id_fk = userId;
          document.type_id_fk = typeId;
          document.added_on = new Date();
          document.added_by = userId;
          let file_name = file.filename;
          document.filename = file_name;
          const saveDocument = await documentRepository.save(document);
          if (!saveDocument) {
            unlinkMultiFiles(files);
            unlinkSingleFile(singleFile?.filename);
            return sendError(res, "Files Not Saved");
          }
        }
      }
    } else {
      return sendError(res, "Wrong Format for documents");
    }

    //documents - end here

    return sendSuccess(res, 'Success', { taxfile });
  } catch (e) {
    unlinkMultiFiles(files);
    unlinkSingleFile(singleFile?.filename);
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
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra, id } = req.body;

  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;

  if (!id) {
    unlinkMultiFiles(files);
    unlinkSingleFile(singleFile?.filename);
    return sendError(res, "Taxfile Id is Required");
  }

  try {
    const userId = req?.userId;

    const taxfileRepo = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepo.findOne({ where: { user_id: userId, id: id } });
    if (!taxfile) {
      return sendError(res, "Taxfile Not Found");
    }

    taxfile.tax_year = tax_year;
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    taxfile.date_of_entry = date_of_entry;
    taxfile.direct_deposit_cra = direct_deposit_cra;
    taxfile.document_direct_deposit_cra = singleFile?.filename ?? ''; //the expression evaluates to '' (an empty string)
    taxfile.updated_by = userId;
    taxfile.updated_on = new Date();

    await requestDataValidation(taxfile);

    let is_old_documents_blank = false;
    if (documents.some((doc: { id: number }) => !doc.id)) {
      is_old_documents_blank = true;
    }

    // if ((!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) && is_old_documents_blank == true) {
    //   return sendError(res, "Files are Required");
    // }

    const savedTaxfile = await taxfileRepo.update(taxfile.id, taxfile);

    if (!savedTaxfile) {
      unlinkMultiFiles(files);
      unlinkSingleFile(singleFile?.filename);
      return sendError(res, "Taxfile Not Updated");
    }

    //documents - start here
    const documentRepository = AppDataSource.getRepository(Documents);
    const oldDocs = await documentRepository.find({ where: { taxfile_id_fk: id, user_id_fk: userId, is_deleted: false } });
    if (oldDocs && Array.isArray(oldDocs)) {
      for (const oldDoc of oldDocs) {
        const existsInNewDocs = documents.some((doc: { id: any }) => doc.id == oldDoc.id);
        if (!existsInNewDocs) {
          oldDoc.is_deleted = true;
          const oldDoc_name = oldDoc.filename;
          const updateOldDoc = await documentRepository.update(oldDoc.id, oldDoc);
          if (!updateOldDoc) {
            unlinkMultiFiles(files);
            unlinkSingleFile(singleFile?.filename);
            return sendError(res, "Unable to delete Old file");
          }
          // let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', oldDoc_name);
          // if (fs.existsSync(filepath)) {
          //   fs.unlinkSync(filepath);
          // }
        }
      }
    } else {
      return sendError(res, "Unable to fetch old files");
    }

    if (documents && Array.isArray(documents) && files && Array.isArray(files)) {
      for (let i = 0; i < files.length; i++) {
        if (documents[i]['typeid'] && documents[i]['typeid'] !== null && documents[i]['typeid'] !== undefined && documents[i]['typeid'] !== "") {
          const file = files[i];
          const typeId = documents[i]['typeid'];
          const documentTypeRepo = AppDataSource.getRepository(DocumentTypes);
          const documentType = await documentTypeRepo.findOne({ where: { id: typeId } });
          if (!documentType) {
            unlinkMultiFiles(files);
            unlinkSingleFile(singleFile?.filename);
            return sendError(res, "Invalid Document Type Id");
          }

          const document = new Documents();
          document.taxfile_id_fk = id;
          document.user_id_fk = userId;
          document.type_id_fk = typeId;
          document.added_by = userId;
          document.added_on = new Date();
          let file_name = file.filename;
          document.filename = file_name;
          const saveDocument = await documentRepository.save(document);
          if (!saveDocument) {
            unlinkMultiFiles(files);
            unlinkSingleFile(singleFile?.filename);
            return sendError(res, "Files Not Saved");
          }
        }
      }
    } else {
      return sendError(res, "Wrong Format for New Files");
    }
    //documents - end here

    return sendSuccess(res, 'Success', { taxfile });
  } catch (e) {
    unlinkMultiFiles(files);
    unlinkSingleFile(singleFile?.filename);
    return handleCatch(res, e);
  }
};

export const taxFileDetails = async (req: Request, res: Response) => {

  try {
    const id = parseInt(req?.params?.id)
    if (!id) {
      return sendError(res, "Taxfile Id is Required");
    }
    const userId = req?.userId;
    const taxRepo = AppDataSource.getRepository(Taxfile);
    // const taxfile = await taxRepo.findOne({ where: { id: id, user_id: userId } });
    const taxfile = await taxRepo.findOne({
      where: { id: id, user_id: userId }, relations: ['marital_status_detail', 'province_detail', 'user_detail'], select: {
        user_detail: {
          email: true,
        },
      }
    });

    if (!taxfile) {
      return sendError(res, "Taxfile Not Found");
    }


    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id, user_id_fk: userId, is_deleted: false }, relations: ['type'] });
    if (!documents) {
      return sendError(res, "Documents Not Found");
    }

    const base_url = process.env.BASE_URL;


    const documentsWithPath = documents.map(doc => ({
      ...doc,
      full_path: `${base_url}/storage/documents/${doc.filename}`
    }));

    const taxfileMod = { ...taxfile, documents: documentsWithPath, document_direct_deposit_cra: `${base_url}/storage/documents/${taxfile.document_direct_deposit_cra}` }
    return sendSuccess(res, 'Success', { taxfile: taxfileMod });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const userTaxFileList = async (req: Request, res: Response) => {

  try {
    const userId = req?.userId;

    const taxRepo = AppDataSource.getRepository(Taxfile);
    const taxfiles = await taxRepo.find({
      where: { user_id: userId }, relations: ['marital_status_detail', 'province_detail', 'user_detail'], select: {
        user_detail: {
          email: true,
        },
      }
    });

    if (!taxfiles) {
      return sendError(res, "No record found")
    }
    return sendSuccess(res, 'Success', { taxfiles })
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const addClientMessage = async (req: Request, res: Response) => {
  const { message, taxfile_id } = req.body;
  if (!taxfile_id) {
    return sendError(res, "Please Provide Taxfile Id");
  }
  try {
    const userId = req?.userId;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, user_id: userId } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found or not associated with the user' });
    }

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.taxfile_id_fk = taxfile_id;
    msgTab.message = message;
    msgTab.category = "GENERAL";
    msgTab.user_type = "CLIENT";
    msgTab.client_id_fk = userId;
    msgTab.added_by = userId;
    let msgTime = new Date();
    msgTab.added_on = msgTime;

    await requestDataValidation(msgTab);
    const saveMsg = await msgRepo.save(msgTab);
    if (!saveMsg) {
      return sendError(res, "Unable to Save Message");
    }

    let clientMsgCount = parseInt(String(taxfile.client_message_count)) || 0;
    if (clientMsgCount >= 0) {
      clientMsgCount = clientMsgCount + 1;
    } else {
      clientMsgCount = 1;
    }
    taxfile.client_message_count = clientMsgCount;
    taxfile.client_last_msg_time = msgTime;
    const updateCount = await taxfileRepository.update(taxfile.id, taxfile);
    if (!updateCount) {
      return sendError(res, "Unable to update Message Count");
    }

    return sendSuccess(res, "Message Added Successfully", { msgTab }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getClientMessages = async (req: Request, res: Response) => {
  try {

    const taxfile_id = parseInt(req?.params?.id)

    const userId = req?.userId;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id, user_id: userId } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found or not associated with the user' });
    }

    const messageRepository = AppDataSource.getRepository(Messages);
    const messages = await messageRepository.find({
      where: { taxfile_id_fk: taxfile_id }, relations: ['executive_detail'], select: {
        executive_detail: {
          name: true,
        },
      }
    });

    return sendSuccess(res, "Messages Fetched Successfully", { messages }, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};


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

export const getSpouse = async (req: Request, res: Response) => {
  try {
    const userId = req?.userId;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId, id_status: "ACTIVE", is_deleted: false, verify_status: "VERIFIED", spouse_invite_status: "ACCEPTED" } });
    if (!user) {
      return sendError(res, "Spouse Not Found");
    }

    const spouse_id = user.spouse_id;
    const spouse = await userRepository.findOne({ where: { id: spouse_id, id_status: "ACTIVE", is_deleted: false, verify_status: "VERIFIED", spouse_invite_status: "ACCEPTED", spouse_id: userId }, select: ["email"] });
    if (!spouse) {
      return sendError(res, "Invalid Spouse");
    }

    return sendSuccess(res, "Success", { spouse }, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};








const geenrateToken = () => {
  return uuidv4();
}



const unlinkMultiFiles = (files: Express.Multer.File[] = []) => {
  for (const file of files as { filename: string }[]) {
    let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}

const unlinkSingleFile = (filename: any = null) => {
  if (filename != null) {
    let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }
}
