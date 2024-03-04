import { Request, Response } from 'express';
import { Executive } from '../entites/Executive';
import { ExecutiveLog } from '../entites/ExecutiveLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { Taxfile } from '../entites/Taxfile';
import { TaxfileStatus } from '../entites/TaxfileStatus';
import { TaxfileStatusLog } from '../entites/TaxfileStatusLog';
import { UserLog } from '../entites/UserLog';
import { Messages } from '../entites/messages';
import { handleCatch, requestDataValidation, sendError, sendSuccess } from '../utils/responseHanlder';
import { Documents } from '../entites/Documents';
import { sendEmail } from '../utils/sendMail';
import { Templates } from '../entites/Templates';
import bcrypt from 'bcrypt';
import { MoreThan } from 'typeorm';
import { Profile } from '../entites/Profile';
import fs, { stat } from "fs";
import path from "path";
import { dec, enc } from '../utils/commonFunctions';
import { User } from '../entites/User';
import { DocumentTypes } from '../entites/DocumentTypes';
import { sendEmailNotifyClientNewMessages, sendForgetPasswordOtp, sendUploadedDocumentNotify } from '../services/EmailManager';


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0 || !password || password?.trim() === "" || password?.length <= 0) {
    return sendError(res, "Email and Password are required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    const executiveRepository = AppDataSource.getRepository(Executive);
    const executive = await executiveRepository.findOne({ where: { email: lowerCaseEmail } });
    if (!executive) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    const passwordMatch = await bcrypt.compare(password, executive.password);
    if (!passwordMatch) {
      return sendError(res, "Invalid password");
    }

    // if (executive.password !== password) {
    //   return res.status(400).json({ message: 'Invalid password' });
    // }

    const token = geenrateToken();

    const executiveLog = new ExecutiveLog();
    executiveLog.executive_id_fk = executive.id;
    executiveLog.key = token;
    executiveLog.user_type = executive.user_type;

    const userLogRepository = AppDataSource.getRepository(ExecutiveLog);
    await userLogRepository.save(executiveLog);

    res.status(200).json({ message: 'LoggedIn successfully', token });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const logout = async (req: Request, res: Response) => {
  const execId = req?.execId;
  const execToken = req?.execToken;
  try {
    const execLogRepo = AppDataSource.getRepository(ExecutiveLog);
    const logoutStatus: any = await execLogRepo.findOne({ where: { key: execToken, executive_id_fk: execId } });
    logoutStatus.id_status = "INACTIVE";
    logoutStatus.is_deleted = true;
    await execLogRepo.update(logoutStatus.id, logoutStatus);

    return sendSuccess(res, "Logged out Successfully", {}, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const updateTaxfileStatus = async (req: Request, res: Response) => {
  const { taxfile_id, file_status } = req.body;
  if (!taxfile_id) {
    return sendError(res, "Taxfile id is required")
  }
  if (!file_status) {
    return sendError(res, "File Status is Required")
  }
  const execId = req?.execId;
  try {
    const statusRepository = AppDataSource.getRepository(TaxfileStatus);
    const taxfileStatus = await statusRepository.findOne({ where: { code: file_status } });
    if (!taxfileStatus) {
      return res.status(400).json({ message: 'Wrong Taxfile Status' });
    }


    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id } });
    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    const oldStatus = taxfile.file_status;
    const oldStatusUpdatedBy = taxfile.file_status_updated_by;
    const oldStatusUpdatedOn = taxfile.file_status_updated_on;

    const taxfileStatusLog = new TaxfileStatusLog();
    taxfileStatusLog.taxfile_id_fk = taxfile_id;
    taxfileStatusLog.last_file_status = oldStatus;
    taxfileStatusLog.last_file_status_updated_by = oldStatusUpdatedBy;
    taxfileStatusLog.last_file_status_updated_on = oldStatusUpdatedOn;

    const statusLogRepository = AppDataSource.getRepository(TaxfileStatusLog);
    await statusLogRepository.save(taxfileStatusLog);


    taxfile.file_status = file_status; //update with new status
    taxfile.file_status_updated_by = execId;
    taxfile.file_status_updated_on = new Date();

    await requestDataValidation(taxfile)

    // Save the updated taxfile record
    await taxfileRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile Status updated successfully', taxfile });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getTaxfileStatus = async (req: Request, res: Response) => {
  try {
    const taxfileStatusRepo = AppDataSource.getRepository(TaxfileStatus);
    const taxfileStatusList = await taxfileStatusRepo.find();

    return sendSuccess(res, "Success", { taxfileStatusList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const addExecutiveMsg = async (req: Request, res: Response) => {
  const { message, user_id, category, notify_client } = req.body;
  if (!user_id) {
    return sendError(res, "Please provide Id of user")
  }
  if (!message || message?.trim() === "" || message?.length <= 0) {
    return sendError(res, "Please Provide message");
  }
  try {
    const execId = req?.execId;
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: user_id, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "User Not Exists");
    }

    const user_email_decoded = dec(user.email);

    const templateRepo = AppDataSource.getRepository(Templates);
    const template = await templateRepo.findOne({ where: { code: category, is_deleted: false, id_status: "ACTIVE" } });
    const is_fixed = template?.is_fixed;
    const is_fixed_category: any = template?.code;

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.reply_to_id_fk = user_id;
    msgTab.message = message;
    if (is_fixed != true) {
      msgTab.category = "GENERAL";
    } else {
      msgTab.category = is_fixed_category;
    }
    msgTab.user_type = "EXECUTIVE";
    msgTab.executive_id_fk = execId;
    msgTab.notify_client = notify_client;
    msgTab.added_by = execId;
    msgTab.added_on = new Date();

    await requestDataValidation(msgTab);

    await msgRepo.save(msgTab);

    let msgCount = parseInt(String(user.message_by_executive_count)) || 0;
    if (msgCount >= 0) {
      msgCount = msgCount + 1;
    } else {
      msgCount = 1;
    }
    user.message_by_executive_count = msgCount;
    const updateCount = await userRepo.update(user.id, user);
    if (!updateCount) {
      return sendError(res, "Unable to update Message Count");
    }


    if (notify_client) {
      sendEmailNotifyClientNewMessages(user_email_decoded);
    }
    return sendSuccess(res, "Message Added Successfully", { msgTab }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getExecutiveMsg = async (req: Request, res: Response) => {
  try {
    const user_id = parseInt(req?.params?.id)
    if (!user_id) {
      return sendError(res, "Please Provide Id of User");
    }

    const execId = req?.execId;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: user_id, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "User Not Exists");
    }

    const messageRepository = AppDataSource.getRepository(Messages);
    const messages = await messageRepository.find({
      where: { reply_to_id_fk: user_id }, relations: ['executive_detail'], select: {
        executive_detail: {
          name: true,
        },
      }
    });


    const updateCount = await userRepo.update(user.id, { client_message_count: 0 });
    if (!updateCount) {
      return sendError(res, "Unable to Reset Message Count");
    }

    return sendSuccess(res, "Messages Fetched Successfully", { messages }, 200);

  } catch (e) {
    return handleCatch(res, e);
  }
};




export const addExecutiveMessage = async (req: Request, res: Response) => {
  const { message, taxfile_id, category } = req.body;
  if (!taxfile_id) {
    return sendError(res, "Taxfile id is required")
  }
  // if (!category) {
  //   return sendError(res, "Taxfile id is required")
  // }
  try {
    const execId = req?.execId;
    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }
    // if (!token) {
    //   return res.status(400).json({ message: 'Token is required' });
    // }
    // const executiveLogRepository = AppDataSource.getRepository(ExecutiveLog);
    // const executiveLog = await executiveLogRepository.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });
    // if (!executiveLog) {
    //   return res.status(400).json({ message: 'Invalid token or token expired' });
    // }
    // const executiveId = executiveLog.executive_id_fk;

    const templateRepo = AppDataSource.getRepository(Templates);
    const template = await templateRepo.findOne({ where: { code: category, is_deleted: false, id_status: "ACTIVE" } });
    const is_fixed = template?.is_fixed;
    const is_fixed_category: any = template?.code;

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.taxfile_id_fk = taxfile_id;
    msgTab.message = message;
    if (is_fixed != true) {
      msgTab.category = "GENERAL";
    } else {
      msgTab.category = is_fixed_category;
    }
    msgTab.user_type = "EXECUTIVE";
    msgTab.executive_id_fk = execId;
    msgTab.added_by = execId;
    msgTab.added_on = new Date();

    await requestDataValidation(msgTab);

    await msgRepo.save(msgTab);
    return sendSuccess(res, "Message Added Successfully", { msgTab }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const getExecutiveMessages = async (req: Request, res: Response) => {
  // const { token, taxfile_id } = req.body;
  try {
    const taxfile_id = parseInt(req?.params?.id)
    if (!taxfile_id) {
      return sendError(res, "Taxfile Id is required");
    }

    const execId = req?.execId;
    // if (!token) {
    //   return res.status(400).json({ message: 'Token is required' });
    // }

    // const executiveLogRepository = AppDataSource.getRepository(ExecutiveLog);
    // const executiveLog = await executiveLogRepository.findOne({ where: { key: token, is_deleted: false, id_status: "ACTIVE" } });
    // if (!executiveLog) {
    //   return res.status(400).json({ message: 'Invalid token or token expired' });
    // }

    // const executiveId = executiveLog.executive_id_fk;

    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: taxfile_id } });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
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


export const taxfilesList = async (req: Request, res: Response) => {

  const { tax_file_status } = req.query;
  //--- data fiter
  let tax_file_status_string = null
  if (tax_file_status && typeof tax_file_status == 'string') {

    const tax_file_status_array = tax_file_status.split(',');
    tax_file_status_string = tax_file_status_array.map((itm: any) => { return `'${itm?.toString()?.trim()}'` }).filter((itm: any) => itm.length > 0)
  }


  try {
    const taxfilesRepo = AppDataSource.getRepository(Taxfile);

    let query = `SELECT t.id AS id,pv.name AS taxfile_province,moved_to_canada,date_of_entry,direct_deposit_cra,document_direct_deposit_cra,ts.name AS file_status_name,ts.code AS file_status,tax_year,t.added_on,prof.firstname,prof.lastname,prof.date_of_birth,prof.street_number,prof.street_name,prof.city,prof.postal_code,prof.mobile_number,m.name AS marital_status,p.name AS province, us.email AS email,t.user_id AS user_id FROM taxfile t LEFT JOIN profile prof ON t.user_id = prof.user_id LEFT JOIN marital_status m ON prof.marital_status = m.code LEFT JOIN provinces p ON prof.province = p.code LEFT JOIN provinces pv ON t.taxfile_province = pv.code LEFT JOIN taxfile_status ts ON t.file_status = ts.code LEFT JOIN user us ON t.user_id = us.id WHERE 1= 1 `;

    if (tax_file_status_string && tax_file_status_string.length > 0) {
      query += ` AND t.file_status IN (${tax_file_status_string})`;
    }

    const taxfiles = await taxfilesRepo.query(query);
    // const taxfiles = await taxfilesRepo.query(
    //   `SELECT t.id AS id,t.moved_to_canada,t.date_of_entry,t.direct_deposit_cra,t.document_direct_deposit_cra,t.file_status,t.tax_year,t.added_on,prof.firstname,prof.lastname,prof.date_of_birth,prof.street_number,prof.street_name,prof.city,prof.postal_code,prof.mobile_number FROM taxfile t LEFT JOIN profile prof ON t.user_id = prof.user_id LEFT JOIN marital_status m ON prof.marital_status = m.code LEFT JOIN provinces p ON prof.province = p.code LEFT JOIN provinces pv ON t.taxfile_province = p.code`,
    // );

    const taxfilesDecoded = taxfiles.map((taxfile: any) => {
      const decodedMobileNumber = dec(taxfile.mobile_number);
      const decodedEmail = dec(taxfile.email);
      return { ...taxfile, mobile_number: decodedMobileNumber, email: decodedEmail };
    });

    return sendSuccess(res, "Taxfiles Fetched Successfully", { tax_file_status_string, taxfiles: taxfilesDecoded }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const taxfilesListWithCount = async (req: Request, res: Response) => {
  try {
    const taxfilesRepo = AppDataSource.getRepository(Taxfile);
    const taxfiles = await taxfilesRepo.find({
      where: { client_message_count: MoreThan(0) }, relations: ['user_detail'], select: {
        user_detail: {
          email: true,
        },
      }
    });

    return sendSuccess(res, "Success", { taxfiles }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const userMsgListCount = async (req: Request, res: Response) => {
  const { unread, search } = req?.query;
  try {
    if (!unread || unread != "true") {
      // const messageRepository = AppDataSource.getRepository(Messages);
      // const messages = await messageRepository.query(
      //   `SELECT us.id AS user_id,us.email AS user_email, us.client_message_count,us.client_last_msg_time,us.client_last_msg, prof.firstname,prof.lastname FROM messages msg LEFT JOIN user us ON msg.reply_to_id_fk = us.id LEFT JOIN profile prof ON us.id = prof.user_id WHERE msg.user_type = 'CLIENT' AND us.id_status = 'ACTIVE' AND us.is_deleted = 'false' GROUP BY msg.reply_to_id_fk`,
      // );       

      // this query is also necessary but commented for the time if needed in future

      // const msgDecoded = messages.map((msg: any) => {
      //   const decodedEmail = dec(msg.user_email);
      //   return { ...msg, user_email: decodedEmail };
      // });
      // if (!messages) {
      //   return sendError(res, "Unable to fetch Records");
      // }
      // return sendSuccess(res, "Messages Fetched Successfully", { list: msgDecoded }, 200);


      const userRepo = AppDataSource.getRepository(User);


      let query = `SELECT us.id AS user_id,us.email AS user_email, us.client_message_count,us.client_last_msg_time,us.client_last_msg, prof.firstname,prof.lastname FROM user us LEFT JOIN profile prof ON us.id = prof.user_id WHERE us.id_status = 'ACTIVE' AND us.is_deleted = 'false'`;

      if (search && search != null && search != "" && search != undefined) {
        let encoded_email = enc((search as string).toLowerCase());
        query += ` AND prof.firstname LIKE '%${search}%' OR prof.lastname LIKE '%${search}%' OR prof.mob_last_digits LIKE '%${search}%' OR us.email = '${encoded_email}'`;
      }


      query += ` ORDER BY us.client_last_msg_time DESC`;

      const user = await userRepo.query(
        query,
      );

      const usDecoded = user.map((us: any) => {
        const decodedEmail = dec(us.user_email);
        return { ...us, user_email: decodedEmail };
      });

      if (!user) {
        return sendError(res, "Unable to fetch Records");
      }
      return sendSuccess(res, "Success", { list: usDecoded }, 200);

    } else if (unread == "true" || unread == true) {

      const userRepo = AppDataSource.getRepository(User);
      // const user = await userRepo.find({
      //   where: { id_status: "ACTIVE", is_deleted: false, client_message_count: MoreThan(0) }, select: {
      //     id: true,ss
      //     email: true,
      //     client_message_count: true,
      //     client_last_msg_time: true,

      //   }
      // });
      const user = await userRepo.query(
        `SELECT us.id AS user_id,us.email AS user_email, us.client_message_count,us.client_last_msg_time,us.client_last_msg, prof.firstname,prof.lastname FROM user us LEFT JOIN profile prof ON us.id = prof.user_id WHERE us.id_status = 'ACTIVE' AND us.is_deleted = 'false' AND client_message_count > 0 ORDER BY us.client_last_msg_time DESC`,
      );
      const usDecoded = user.map((us: any) => {
        const decodedEmail = dec(us.user_email);
        return { ...us, user_email: decodedEmail };
      });

      if (!user) {
        return sendError(res, "Unable to fetch Records");
      }
      return sendSuccess(res, "Success", { list: usDecoded }, 200);

    }

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const taxfileDetail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req?.params?.id)
    if (!id) {
      return sendError(res, "Taxfile Id is Required");
    }
    const execId = req?.execId;

    const taxRepo = AppDataSource.getRepository(Taxfile);

    // const taxfile = await taxRepo.query(
    //   `SELECT t.*, p.name AS province_name, m.name AS marital_status_name
    //    FROM taxfile t
    //    LEFT JOIN provinces p ON t.province = p.code
    //    LEFT JOIN marital_status m ON t.marital_status = m.code
    //    WHERE t.id = ?`,
    //   [id]
    // );

    // const taxfile = await taxRepo.findOne({
    //   where: { id: id }, relations: ['marital_status_detail', 'province_detail', 'user_detail'], select: {
    //     user_detail: {
    //       email: true,
    //     },
    //   }
    // });
    const taxfile = await taxRepo.findOne({
      where: { id: id }
    });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
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


    const user_id = taxfile.user_id;
    const profileRepo = AppDataSource.getRepository(Profile);
    const profile = await profileRepo.findOne({
      where: { user_id: user_id }, relations: ['marital_status_detail', 'province_detail']
    });
    if (!profile) {
      return sendError(res, "Profile Not Found");
    }

    profile.mobile_number = dec(profile.mobile_number);

    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id, is_deleted: false }, relations: ['type'] });
    if (!documents) {
      return res.status(400).json({ message: 'Documents not found' });
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


    // taxfile.client_message_count = 0;
    const updateCount = await taxRepo.update(taxfile.id, { client_message_count: 0 });
    if (!updateCount) {
      return sendError(res, "Unable to Reset Message Count");
    }

    res.status(200).json({ message: 'Success', taxfile: taxfileMod });

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { email: lowerCaseEmail, id_status: "ACTIVE" } });
    if (exec) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sendForgetPasswordOtp(lowerCaseEmail, otp);
      exec.otp = otp;
      await execRepo.update(exec.id, exec);

      return sendSuccess(res, "OTP Sent Successfully on Registered Email", {}, 201);
    } else {
      return sendError(res, "Wrong Email");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const newPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0 || !newPassword || newPassword?.trim() === "" || newPassword?.length <= 0) {
    return sendError(res, "Email and Password are required");
  }

  if (!otp) {
    return sendError(res, "Otp is required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { email: lowerCaseEmail, otp: otp, id_status: "ACTIVE" } });
    if (exec) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      exec.password = hashedPassword;
      //exec.password = newPassword;
      exec.otp = '';
      await execRepo.update(exec.id, exec);

      return sendSuccess(res, "Password Changed Successfully", {}, 201);
    } else {
      return sendError(res, "Wrong Email/Otp");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const updatePassword = async (req: Request, res: Response) => {

  const execId = req?.execId;

  const { oldPassword, newPassword } = req.body;
  if (!newPassword) {
    return sendError(res, "Please provide new Password");
  }
  try {
    const hashedPassword_old = await bcrypt.hash(oldPassword, 10);

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { id: execId, id_status: "ACTIVE" } });
    if (exec) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      exec.password = hashedPassword;
      //exec.password = newPassword;
      await execRepo.update(exec.id, exec);

      return sendSuccess(res, "Password Updated Successfully", {}, 201);
    } else {
      return sendError(res, "Wrong Old Password");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};







////////////////////////
//QUERIES FOR ADMIN //START HERE
////////////////////////

export const addExecutive = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!email) {
    return sendError(res, "Email is Required");
  }

  if (!password) {
    return sendError(res, "Password is Required");
  }
  const adminId = req?.execId;
  try {
    const lowerCaseEmail = email.toLowerCase();

    const executive = new Executive();
    executive.name = name;
    executive.email = lowerCaseEmail;
    executive.password = password;
    executive.user_type = "EXECUTIVE";
    executive.added_on = new Date();
    executive.added_by = adminId;
    await requestDataValidation(executive);

    const hashedPassword = await bcrypt.hash(password, 10);
    executive.password = hashedPassword;

    const executiveRepository = AppDataSource.getRepository(Executive);
    await executiveRepository.save(executive);

    res.status(201).json({ message: 'Executive Added successfully', executive });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const updateExecutiveStatus = async (req: Request, res: Response) => {

  const { id_status, executive_id } = req.body;
  if (!id_status || id_status?.trim() === "" || id_status?.length <= 0) {
    return sendError(res, "Id Status is required");
  }
  if (!executive_id) {
    return sendError(res, "Executive Id is required");
  }
  const adminId = req?.execId;
  try {
    if (id_status != "ACTIVE" && id_status != "INACTIVE") {
      return sendError(res, "Wrong Status");
    }

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { id: executive_id, id_status: "ACTIVE", is_deleted: false } });
    if (exec) {
      exec.id_status = id_status;
      exec.updated_on = new Date();
      exec.updated_by = adminId;
      await execRepo.update(exec.id, exec);

      return sendSuccess(res, "Status Updated Successfully", {}, 201);
    } else {
      return sendError(res, "Wrong Executive Id");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};


export const executivesList = async (req: Request, res: Response) => {
  try {
    const execRepo = AppDataSource.getRepository(Executive);
    const execList = await execRepo.find();

    return sendSuccess(res, "Executives Fetched Successfully", { execList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const addTemplate = async (req: Request, res: Response) => {
  const { code, title, description } = req.body;
  if (!code) {
    return sendError(res, "Code is required");
  }

  if (!title) {
    return sendError(res, "Title is required");
  }

  const adminId = req?.execId;
  try {
    const tempRepo = AppDataSource.getRepository(Templates);
    const temp = await tempRepo.findOne({ where: { code: code, id_status: "ACTIVE", is_deleted: false } });
    if (temp) {
      return sendError(res, "Code Already Exists ");
    }

    const templates = new Templates();
    templates.code = code;
    templates.title = title;
    templates.description = description;
    templates.added_on = new Date();
    templates.added_by = adminId;
    await requestDataValidation(templates);


    await tempRepo.save(templates);

    res.status(201).json({ message: 'Template Added successfully', templates });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const templatesList = async (req: Request, res: Response) => {
  try {
    const tempRepo = AppDataSource.getRepository(Templates);
    const tempList = await tempRepo.find();

    return sendSuccess(res, "Templates Fetched Successfully", { tempList }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};




export const updateTaxfileExecutive = async (req: Request, res: Response) => {
  const { documents, id, notify_client } = req.body;

  const files: Express.Multer.File[] = req.files ? (req.files as Express.Multer.File[]).filter(file => file.fieldname.startsWith('documents')) : [];


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
        unlinkMultiFiles(files);
        return sendError(res, "File is required for given Type");
      }
    }
  } else {
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
        unlinkMultiFiles(files);
        return sendError(res, "Document type is required");
      }
    }
  }



  if (!id) {
    unlinkMultiFiles(files);
    return sendError(res, "Taxfile Id is Required");
  }

  try {
    const execId = req?.execId;

    const taxfileRepo = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepo.findOne({ where: { id: id } });
    if (!taxfile) {
      return sendError(res, "Taxfile Not Found");
    }

    const user_id = taxfile.user_id;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: user_id, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "User of this Taxfile Not Exists ");
    }

    const user_email_decoded = dec(user.email);

    await requestDataValidation(taxfile);

    // let is_old_documents_blank = false;
    // if (documents.some((doc: { id: number }) => !doc.id)) {
    //   is_old_documents_blank = true;
    // }

    // if ((!files || !documents || files.length !== documents.length || files.length === 0 || documents.length === 0) && is_old_documents_blank == true) {
    //   return sendError(res, "Files are Required");
    // }

    // const savedTaxfile = await taxfileRepo.update(taxfile.id, taxfile);

    // if (!savedTaxfile) {
    //   unlinkMultiFiles(files);
    //   return sendError(res, "Taxfile Not Updated");
    // }

    //documents - start here
    const documentRepository = AppDataSource.getRepository(Documents);
    const oldDocs = await documentRepository.find({ where: { taxfile_id_fk: id, executive_id_fk: execId, is_deleted: false, user_type: "EXECUTIVE", user_id_fk: user_id } });
    if (oldDocs && Array.isArray(oldDocs)) {
      for (const oldDoc of oldDocs) {
        const existsInNewDocs = documents.some((doc: { id: any }) => doc.id == oldDoc.id);
        if (!existsInNewDocs) {
          oldDoc.is_deleted = true;
          const oldDoc_name = oldDoc.filename;
          const updateOldDoc = await documentRepository.update(oldDoc.id, oldDoc);
          if (!updateOldDoc) {
            unlinkMultiFiles(files);
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
          // const documentTypeRepo = AppDataSource.getRepository(DocumentTypes);
          // const documentType = await documentTypeRepo.findOne({ where: { id: typeId } });
          // if (!documentType) {
          //   unlinkMultiFiles(files);
          //   unlinkSingleFile(singleFile?.filename);
          //   return sendError(res, "Invalid Document Type Id");
          // }

          const document = new Documents();
          document.taxfile_id_fk = id;
          document.user_id_fk = user_id;
          document.executive_id_fk = execId;
          document.user_type = "EXECUTIVE";
          document.type_id_fk = typeId;
          document.added_by = execId;
          document.added_on = new Date();
          let file_name = file.filename;
          document.filename = file_name;
          const saveDocument = await documentRepository.save(document);
          if (!saveDocument) {
            unlinkMultiFiles(files);
            return sendError(res, "Files Not Saved");
          }
        }
      }
    } else {
      return sendError(res, "Wrong Array Format of Files");
    }
    //documents - end here

    if (notify_client) {
      sendUploadedDocumentNotify(user_email_decoded);
    }


    return sendSuccess(res, 'Success', { taxfile });
  } catch (e) {
    unlinkMultiFiles(files);
    return handleCatch(res, e);
  }
};





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



const geenrateToken = () => {
  return uuidv4();
}



