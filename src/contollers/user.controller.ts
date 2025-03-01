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
import { sendSpouseInvitationMail } from '../services/EmailManager';
import { dec, enc } from '../utils/commonFunctions';
import { TaxfileStatus } from '../entites/TaxfileStatus';




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
  const { firstname, lastname, date_of_birth, marital_status, street_name, city, province, postal_code, mobile_number, sin, street_number, existing_client } = req.body;

  // if(!marital_status){
  //   return sendError(res, "Marital Status is required");
  // }

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
    profile.mobile_number = mobile_number;
    profile.user = user!;
    profile.existing_client = existing_client;
    profile.updated_on = new Date();
    profile.updated_by = userId;

    await requestDataValidation(profile);

    profile.mobile_number = enc(mobile_number?.replace(/\D/g, '')?.slice(-10)) ?? ''; //after validation splice
    profile.mob_last_digits = mobile_number?.replace(/\D/g, '')?.slice(-5);

    await profileRepo.save(profile);

    profile.mobile_number = dec(profile.mobile_number);
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
    // if (profile) {
    //   if (profile.mobile_number) {
    //     profile.mobile_number = dec(profile.mobile_number) ?? '';
    //   }
    // }
    if (!profile) {
      return sendError(res, "Unable to fetch profile");
    }

    profile.mobile_number = dec(profile.mobile_number);
    sendSuccess(res, "Success", { profile })

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const addTaxfile = async (req: Request, res: Response) => {
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra } = req.body;


  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;

  if (documents && Array.isArray(documents) && documents?.length >= 0) {
    for (let i = 0; i < documents?.length; i++) {
      let file = '';
      if (files[i] && files[i]['filename']) {
        file = files[i]['filename'];
      }
      let typeid = 0;
      if (documents[i] && documents[i]['typeid']) {
        typeid = parseInt(documents[i]['typeid']) || 0;
      }

      if (typeid != 0 && file?.length <= 0) {
        unlinkSingleFile(singleFile?.filename);
        unlinkMultiFiles(files);
        return sendError(res, "File is required for given Type");
      }
    }
  } else {
    unlinkSingleFile(singleFile?.filename);
    unlinkMultiFiles(files);
    return sendError(res, "Files and its Types are required");
  }

  if (files && Array.isArray(files) && files?.length > 0) {
    for (let i = 0; i < files?.length; i++) {
      let file = '';
      if (files[i] && files[i]['filename']) {
        file = files[i]['filename'];
      }
      let typeid = 0;
      if (documents[i] && documents[i]['typeid']) {
        typeid = parseInt(documents[i]['typeid']) || 0;
      }

      if (typeid == 0 && file?.length > 0) {
        unlinkSingleFile(singleFile?.filename);
        unlinkMultiFiles(files);
        return sendError(res, "Document type is required");
      }
    }
  }


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
    // taxfile.profile_id_fk = profile.id
    // taxfile.firstname = profile.firstname;
    // taxfile.lastname = profile.lastname;
    // taxfile.date_of_birth = profile.date_of_birth;
    // taxfile.marital_status = profile.marital_status;
    // taxfile.street_number = profile.street_number;
    // taxfile.street_name = profile.street_name;
    // taxfile.city = profile.city;
    // taxfile.province = profile.province;
    // taxfile.postal_code = profile.postal_code;
    // taxfile.mobile_number = profile.mobile_number;
    taxfile.tax_year = '2024';
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    if (moved_to_canada == "YES") {
      taxfile.date_of_entry = date_of_entry;
    }
    taxfile.direct_deposit_cra = direct_deposit_cra;
    if (direct_deposit_cra == "YES") {
      taxfile.document_direct_deposit_cra = singleFile?.filename ?? ''; //the expression evaluates to '' (an empty string)
    } else {
      unlinkSingleFile(singleFile?.filename);
    }
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
          document.user_type = "CLIENT";
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
  const { tax_year, documents, taxfile_province, moved_to_canada, date_of_entry, direct_deposit_cra, document_direct_deposit_cra, id, is_deleted_deposit_cra_doc, } = req.body;

  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];

  const singleFile = req.files ? (req.files as Express.Multer.File[]).find(file => file.fieldname === 'document_direct_deposit_cra') : undefined;



  if (documents && Array.isArray(documents) && documents?.length >= 0) {
    for (let i = 0; i < documents?.length; i++) {
      let file = '';
      if (files[i] && files[i]['filename']) {
        file = files[i]['filename'];
      }
      let typeid = 0;
      if (documents[i] && documents[i]['typeid']) {
        typeid = parseInt(documents[i]['typeid']) || 0;
      }

      if (typeid != 0 && file?.length <= 0) {
        unlinkSingleFile(singleFile?.filename);
        unlinkMultiFiles(files);
        return sendError(res, "File is required for given Type");
      }
    }
  } else {
    unlinkSingleFile(singleFile?.filename);
    unlinkMultiFiles(files);
    return sendError(res, "Files and its Types are required");
  }

  if (files && Array.isArray(files) && files?.length > 0) {
    for (let i = 0; i < files?.length; i++) {
      let file = '';
      if (files[i] && files[i]['filename']) {
        file = files[i]['filename'];
      }
      let typeid = 0;
      if (documents[i] && documents[i]['typeid']) {
        typeid = parseInt(documents[i]['typeid']) || 0;
      }

      if (typeid == 0 && file?.length > 0) {
        unlinkSingleFile(singleFile?.filename);
        unlinkMultiFiles(files);
        return sendError(res, "Document type is required");
      }
    }
  }


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

    const file_status = taxfile.file_status;
    if (file_status != "NEEDS_RESUBMISSION" && file_status != "NEW_REQUEST") {
      return sendError(res, "Updation not allowed.Please review your file status");
    }

    const singlefile_old_name = taxfile.document_direct_deposit_cra;

    taxfile.tax_year = tax_year;
    taxfile.taxfile_province = taxfile_province;
    taxfile.moved_to_canada = moved_to_canada;
    if (moved_to_canada == "YES") {
      taxfile.date_of_entry = date_of_entry;
    }
    taxfile.direct_deposit_cra = direct_deposit_cra;
    // if (direct_deposit_cra == "YES") {
    //   taxfile.document_direct_deposit_cra = singleFile?.filename ?? '';
    // } else {
    //   unlinkSingleFile(singleFile?.filename);
    // }
    if (direct_deposit_cra == "YES") {

      if (singleFile && singleFile.filename && singleFile.filename.length > 0 && singleFile.size > 0) {
        taxfile.document_direct_deposit_cra = singleFile?.filename ?? '';
      } else if (is_deleted_deposit_cra_doc == 'true') {
        taxfile.document_direct_deposit_cra = '';
        unlinkSingleFile(singlefile_old_name);
      }

    } else {
      taxfile.document_direct_deposit_cra = '';
      unlinkSingleFile(singlefile_old_name);
      unlinkSingleFile(singleFile?.filename);
    }
    taxfile.updated_by = userId;
    taxfile.updated_on = new Date();

    await requestDataValidation(taxfile);

    // let is_old_documents_blank = false;
    // if (documents.some((doc: { id: number }) => !doc.id)) {
    //   is_old_documents_blank = true;
    // }

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
    const oldDocs = await documentRepository.find({ where: { taxfile_id_fk: id, user_id_fk: userId, user_type: "CLIENT", is_deleted: false } });
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
          document.user_type = "CLIENT";
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
      return sendError(res, "Wrong Array Format of Files");
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
    // const taxfile = await taxRepo.findOne({
    //   where: { id: id, user_id: userId }, relations: ['marital_status_detail', 'province_detail', 'user_detail'], select: {
    //     user_detail: {
    //       email: true,
    //     },
    //   }
    // });
    // const taxfile = await taxRepo.findOne({
    //   where: { id: id, user_id: userId }, relations: ['marital_status_detail', 'province_detail', 'profile_detail']
    // });
    const taxfile = await taxRepo.findOne({
      where: { id: id, user_id: userId }
    });

    if (!taxfile) {
      return sendError(res, "Taxfile Not Found");
    }


    const file_status = taxfile.file_status;
    const taxfileStatusRepo = AppDataSource.getRepository(TaxfileStatus);
    const taxfileStatus = await taxfileStatusRepo.findOne({
      where: { code: file_status }
    });
    const file_status_name = taxfileStatus?.name;

    if (!taxfile) {
      return sendError(res, "File Status Not Found");
    }



    // const profile_id = taxfile.profile_id_fk;
    const profileRepo = AppDataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({
      where: { user_id: userId }, relations: ['marital_status_detail', 'province_detail']
    });
    if (!profile) {
      return sendError(res, "Profile Not Found");
    }
    profile.mobile_number = dec(profile.mobile_number);


    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id, user_id_fk: userId, is_deleted: false }, relations: ['type'] });
    if (!documents) {
      return sendError(res, "Documents Not Found");
    }

    const base_url = process.env.BASE_URL;

    const direct_deposit_cra = taxfile.direct_deposit_cra;
    const document_direct_deposit_cra = taxfile.document_direct_deposit_cra;

    const documentsWithPath = documents.map(doc => ({
      ...doc,
      full_path: `${base_url}/storage/documents/${doc.filename}`
    }));

    let taxfileMod = { ...taxfile, file_status_name: file_status_name, documents: documentsWithPath, profile: profile };

    (taxfileMod as any).showSingleDocument = false;
    if (direct_deposit_cra == "YES") {
      if (document_direct_deposit_cra != null && document_direct_deposit_cra != "" && document_direct_deposit_cra != undefined) {
        let single_filepath = path.join(__dirname, '..', '..', 'storage', 'documents', taxfile.document_direct_deposit_cra);
        if (fs.existsSync(single_filepath)) {
          (taxfileMod as any).showSingleDocument = true;
          taxfileMod.document_direct_deposit_cra = `${base_url}/storage/documents/${taxfile.document_direct_deposit_cra}`;
        }
      } else {
        (taxfileMod as any).showSingleDocument = false;
      }

    }

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
      where: { user_id: userId,tax_year:'2024' }, 
      relations: ['marital_status_detail', 'province_detail', 'user_detail'], 
      select: {
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


export const addClientMsg = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message || message?.trim() === "" || message?.length <= 0) {
    return sendError(res, "Please Provide message");
  }
  try {
    const userId = req?.userId;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "User Not Exists");
    }

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.message = message;
    msgTab.category = "GENERAL";
    msgTab.user_type = "CLIENT";
    msgTab.client_id_fk = userId;
    msgTab.reply_to_id_fk = userId;
    msgTab.added_by = userId;
    let msgTime = new Date();
    msgTab.added_on = msgTime;

    await requestDataValidation(msgTab);
    const saveMsg = await msgRepo.save(msgTab);
    if (!saveMsg) {
      return sendError(res, "Unable to Save Message");
    }

    let clientMsgCount = parseInt(String(user.client_message_count)) || 0;
    if (clientMsgCount >= 0) {
      clientMsgCount = clientMsgCount + 1;
    } else {
      clientMsgCount = 1;
    }
    user.client_message_count = clientMsgCount;
    user.client_last_msg_time = msgTime;
    user.client_last_msg = message;
    const updateCount = await userRepo.update(user.id, user);
    if (!updateCount) {
      return sendError(res, "Unable to update Message Count");
    }

    return sendSuccess(res, "Message Added Successfully", { msgTab }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};
export const getClientMsg = async (req: Request, res: Response) => {
  try {
    const userId = req?.userId;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "User Not Exists");
    }

    const messageRepository = AppDataSource.getRepository(Messages);
    const messages = await messageRepository.find({
      where: { reply_to_id_fk: userId }, relations: ['executive_detail'], select: {
        executive_detail: {
          name: true,
        },
      }
    });

    const updateCount = await userRepo.update(user.id, { message_by_executive_count: 0 });
    if (!updateCount) {
      return sendError(res, "Unable to Reset Message Count");
    }

    return sendSuccess(res, "Messages Fetched Successfully", { messages }, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getClientMsgCount = async (req: Request, res: Response) => {
  try {
    const userId = req?.userId;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: userId, id_status: "ACTIVE", is_deleted: false }, select: {
        message_by_executive_count: true,
      }
    });
    const msgCount = user?.message_by_executive_count;

    return sendSuccess(res, "Success", { msgCount }, 200);

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
    if (!taxfile_id) {
      return sendError(res, "Taxfile Id is Required");
    }

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
  const { type } = req?.query;
  try {
    const documentTypesRepo = AppDataSource.getRepository(DocumentTypes);
    let documentTypesList: any = [];
    if (type == "executive") {
      documentTypesList = await documentTypesRepo.find({ where: { user_type: "EXECUTIVE" } });
    } else {
      documentTypesList = await documentTypesRepo.find({ where: { user_type: "CLIENT" } });
    }


    return sendSuccess(res, "Document Types Fetched Successfully", { documentTypesList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const sendSpouseInvitation = async (req: Request, res: Response) => {
  const { email } = req.body;
  const userId = req?.userId;
  if (!email) {
    return sendError(res, "Please Provide Email");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const spouseRepo = AppDataSource.getRepository(User);

    const existingSpouse = await spouseRepo.findOne({ where: { email: enc_email, verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: Not(userId), spouse_invite_status: Not("LINKED") } });
    if (!existingSpouse) {
      return sendError(res, "Spouse Not Found/Verification Pending/Already Linked");
    };

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: userId, spouse_invite_status: Not("LINKED") } });
    if (!existingUser) {
      return sendError(res, "Verification Pending/Id Inactive/Already Linked to Spouse");
    };

    const spouse_id = existingSpouse.id;
    const spouse_email = lowerCaseEmail;

    const token = geenrateToken();
    sendSpouseInvitationMail(lowerCaseEmail, dec(existingUser?.email), token);

    existingUser.spouse_invite_token = token;
    existingUser.spouse_email = enc(spouse_email);
    existingUser.spouse_id = spouse_id;
    existingUser.spouse_invite_status = "SENT";

    await userRepo.update(existingUser.id, existingUser);



    return sendSuccess(res, "Invitation Sent successfully.", { spouse_email: spouse_email, invitation_status: "SENT" }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const acceptSpouseInvitation = async (req: Request, res: Response) => {
  const token = req?.params?.token
  if (!token) {
    return sendError(res, "Token is Required");
  }
  try {

    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, spouse_invite_status: Not("LINKED"), spouse_invite_token: token } });
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
    const existingSpouse = await spouseRepo.findOne({ where: { email: spouse_email, verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: spouse_id, spouse_invite_status: Not("LINKED") } });
    if (!existingSpouse) {
      return sendError(res, "Spouse Not Found/Verification Pending/Already Linked");
    };

    existingUser.spouse_invite_status = "LINKED";
    await userRepo.update(existingUser.id, existingUser);

    existingSpouse.spouse_email = user_email;
    existingSpouse.spouse_id = user_id;
    existingSpouse.spouse_invite_status = "LINKED";
    await spouseRepo.update(existingSpouse.id, existingSpouse);

    return sendSuccess(res, "Spouse Linked successfully.", {}, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const unlinkSpouse = async (req: Request, res: Response) => {
  const userId = req?.userId;
  try {
    const userRepo = AppDataSource.getRepository(User);
    const existingUser = await userRepo.findOne({ where: { verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: userId, spouse_invite_status: "LINKED" } });
    if (!existingUser) {
      return sendError(res, "Verification Pending/Id Inactive/Already UnLinked");
    };

    const spouse_id = existingUser.spouse_id;
    const spouse_email = existingUser.spouse_email;

    await userRepo.update(existingUser.id, { spouse_invite_token: "", spouse_invite_status: "UNLINKED", spouse_email: "" });

    const spouseRepo = AppDataSource.getRepository(User);
    const existingSpouse = await spouseRepo.findOne({ where: { email: spouse_email, verify_status: "VERIFIED", id_status: "ACTIVE", is_deleted: false, id: spouse_id, spouse_invite_status: "LINKED" } });
    if (!existingSpouse) {
      return sendError(res, "Spouse Not Found/Verification Pending/Already UnLinked");
    };

    await spouseRepo.update(existingSpouse.id, { spouse_invite_token: "", spouse_invite_status: "UNLINKED", spouse_email: "" });

    return sendSuccess(res, "Unlinked successfully.", { invitation_status: "UNLINKED", spouse_email: "" }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getSpouse = async (req: Request, res: Response) => {
  try {
    const userId = req?.userId;

    const userRepository = AppDataSource.getRepository(User);
    const invitationStatus = await userRepository.findOne({ where: { id: userId, id_status: "ACTIVE", is_deleted: false, verify_status: "VERIFIED" } });
    if (!invitationStatus) {
      return sendError(res, "Invalid User");
    }

    const currentInvitationStatus = invitationStatus?.spouse_invite_status;
    const spouse_id_ifAny = invitationStatus?.spouse_id;
    const spouse_email_ifAny = invitationStatus?.spouse_email;
    if (currentInvitationStatus == "SENT") {
      return sendSuccess(res, "Invitation Already Sent", { spouse_email: dec(spouse_email_ifAny), invitation_status: "SENT" }, 201);
    } else if (currentInvitationStatus == "UNLINKED") {
      return sendSuccess(res, "No Spouse is Linked Yet", { spouse_email: "", invitation_status: "UNLINKED" }, 201);
    } else if (currentInvitationStatus == "LINKED") {

      const spouse = await userRepository.findOne({ where: { id: spouse_id_ifAny, id_status: "ACTIVE", is_deleted: false, verify_status: "VERIFIED", spouse_invite_status: "LINKED", spouse_id: userId }, select: ["email"] });
      if (!spouse) {
        const updateInvitationDetails = await userRepository.update(invitationStatus.id, { spouse_invite_status: "UNLINKED" });
        return sendSuccess(res, "No Spouse is Linked Yet", { spouse_email: "", invitation_status: "UNLINKED" }, 201);
      }

      return sendSuccess(res, "You have one Linked Spouse", { spouse_email: dec(spouse_email_ifAny), invitation_status: "LINKED" }, 201);
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};








const geenrateToken = () => {
  return uuidv4();
}



// const unlinkMultiFiles = (files: Express.Multer.File[] = []) => {
//   for (const file of files as { filename: string }[]) {
//     let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
//     if (fs.existsSync(filepath)) {
//       fs.unlinkSync(filepath);
//     }
//   }
// }
const unlinkMultiFiles = (files: Express.Multer.File[] = []) => {
  for (const file of files as { filename: string }[]) {
    let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', file.filename);
    if (file.filename != null && file.filename != "" && file.filename != undefined) {
      try {
        if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
          fs.unlinkSync(filepath);
        }
      } catch (error) {
      }
    }
  }
}

// const unlinkSingleFile = (filename: any = null) => {
//   if (filename != null) {
//     let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', filename);
//     if (fs.existsSync(filepath)) {
//       fs.unlinkSync(filepath);
//     }
//   }
// }

const unlinkSingleFile = (filename: any = null) => {
  if (filename != null && filename != "" && filename != undefined) {
    let filepath = path.join(__dirname, '..', '..', 'storage', 'documents', filename);
    try {
      if (fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
    }
  }
}