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



export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const executiveRepository = AppDataSource.getRepository(Executive);
    const executive = await executiveRepository.findOne({ where: { email } });
    if (!executive) {
      return res.status(400).json({ message: 'Invalid email' });
    }


    if (executive.password !== password) {
      return res.status(400).json({ message: 'Invalid password' });
    }

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


export const updateTaxfileStatus = async (req: Request, res: Response) => {
  const { id, file_status, token } = req.body;

  try {

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const executiveLogRepo = AppDataSource.getRepository(ExecutiveLog);
    const executiveLog = await executiveLogRepo.findOne({ where: { key: token, is_deleted: false } });
    if (!executiveLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }

    const executiveId = executiveLog.executive_id_fk;

    const statusRepository = AppDataSource.getRepository(TaxfileStatus);
    const taxfileStatus = await statusRepository.findOne({ where: { code: file_status } });
    if (!taxfileStatus) {
      return res.status(400).json({ message: 'Wrong Taxfile Status' });
    }


    const taxfileRepository = AppDataSource.getRepository(Taxfile);
    const taxfile = await taxfileRepository.findOne({ where: { id: id } });
    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    const oldStatus = taxfile.file_status;
    const oldStatusUpdatedBy = taxfile.file_status_updated_by;
    const oldStatusUpdatedOn = taxfile.file_status_updated_on;

    const taxfileStatusLog = new TaxfileStatusLog();
    taxfileStatusLog.taxfile_id_fk = id;
    taxfileStatusLog.last_file_status = oldStatus;
    taxfileStatusLog.last_file_status_updated_by = oldStatusUpdatedBy;
    taxfileStatusLog.last_file_status_updated_on = oldStatusUpdatedOn;

    const statusLogRepository = AppDataSource.getRepository(TaxfileStatusLog);
    await statusLogRepository.save(taxfileStatusLog);


    taxfile.file_status = file_status; //update with new status
    taxfile.file_status_updated_by = executiveId;

    await requestDataValidation(taxfile)

    // Save the updated taxfile record
    await taxfileRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile Status updated successfully', taxfile });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const addExecutiveMessage = async (req: Request, res: Response) => {
  const { message, taxfile_id, category } = req.body;
  try {
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

    const msgRepo = AppDataSource.getRepository(Messages);
    const msgTab = new Messages();
    msgTab.taxfile_id_fk = taxfile_id;
    msgTab.message = message;
    msgTab.category = category;
    msgTab.user_type = "EXECUTIVE";
    msgTab.executive_id_fk = execId;
    msgTab.added_by = execId;

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
  try {
    const taxfilesRepo = AppDataSource.getRepository(Taxfile);
    const taxfiles = await taxfilesRepo.find();

    return sendSuccess(res, "Taxfiles Fetched Successfully", { taxfiles }, 200);
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const taxfileDetail = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req?.params?.id)
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

    const taxfile = await taxRepo.findOne({
      where: { id: id }, relations: ['marital_status_detail', 'province_detail', 'user_detail'], select: {
        user_detail: {
          email: true,
        },
      }
    });

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id }, relations: ['type'] });
    if (!documents) {
      return res.status(400).json({ message: 'Documents not found' });
    }

    const base_url = process.env.BASE_URL;

    const taxfileMod: any = { ...taxfile, document_direct_deposit_cra: `${base_url}/storage/documents/${taxfile.document_direct_deposit_cra}` }

    const documentsWithPath = documents.map(doc => ({
      ...doc,
      full_path: `${base_url}/storage/documents/${doc.filename}`
    }));

    taxfileMod.documents = documentsWithPath;

    res.status(200).json({ message: 'Success', taxfile: taxfileMod });

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { email: email, id_status: "ACTIVE" } });
    if (exec) {
      const subject = "Edutax: Forgot Pasword";
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const message = "<h1>Please use the Given OTP for New Password</h1><br><br>OTP: " + otp;
      await sendEmail(email, subject, message);
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
  try {
    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { email: email, otp: otp, id_status: "ACTIVE" } });
    if (exec) {
      exec.password = newPassword;
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

  try {

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { id: execId, password: oldPassword, id_status: "ACTIVE" } });
    if (exec) {
      exec.password = newPassword;
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
  const { email, password } = req.body;

  try {
    const executive = new Executive();
    executive.email = email;
    executive.password = password;
    executive.user_type = "EXECUTIVE";
    await requestDataValidation(executive);

    const executiveRepository = AppDataSource.getRepository(Executive);
    await executiveRepository.save(executive);

    res.status(201).json({ message: 'Executive Added successfully', executive });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const updateExecutiveStatus = async (req: Request, res: Response) => {

  const { id_status, executiveId } = req.body;

  try {

    const execRepo = AppDataSource.getRepository(Executive);
    const exec = await execRepo.findOne({ where: { id: executiveId, id_status: "ACTIVE", is_deleted: true } });
    if (exec) {
      exec.id_status = id_status;
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

  try {
    const templates = new Templates();
    templates.code = code;
    templates.title = title;
    templates.description = description;
    await requestDataValidation(templates);

    const tempRepo = AppDataSource.getRepository(Templates);
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




const geenrateToken = () => {
  return uuidv4();
}
