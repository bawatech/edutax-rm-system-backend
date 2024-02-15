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
import { handleCatch, requestDataValidation, sendSuccess } from '../utils/responseHanlder';
import { Documents } from '../entites/Documents';



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
    //executiveLog.ulog_privs = 'ADMIN';

    const userLogRepository = AppDataSource.getRepository(ExecutiveLog);
    await userLogRepository.save(executiveLog);

    res.status(200).json({ message: 'LoggedIn successfully', token });
  } catch (e) {
    return handleCatch(res, e);
  }
};



export const addExecutive = async (req: Request, res: Response) => {
  const { email, password } = req.body;



  try {
    const executive = new Executive();
    executive.email = email;
    executive.password = password;
    await requestDataValidation(executive)
    // const errors = await validate(executive);
    // if (errors.length > 0) {
    //   const errorMessages = errors.map(error => {
    //     if (error.constraints) {
    //       return Object.values(error.constraints);
    //     }
    //     return [];
    //   }).flat();
    //   return res.status(400).json({ message: 'Invalid executive data', errors: errorMessages });
    // }

    const executiveRepository = AppDataSource.getRepository(Executive);
    await executiveRepository.save(executive);

    res.status(201).json({ message: 'Executive Added successfully', executive });
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
      where: { taxfile_id_fk: taxfile_id }
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

    const taxfile = await taxRepo.query(
      `SELECT t.*, p.name AS province_name, m.name AS marital_status_name
       FROM taxfile t
       LEFT JOIN provinces p ON t.province = p.code
       LEFT JOIN marital_status m ON t.marital_status = m.code
       WHERE t.id = ?`,
      [id]
    );

    if (!taxfile) {
      return res.status(400).json({ message: 'Taxfile not found' });
    }

    const documentsRepo = AppDataSource.getRepository(Documents);
    const documents = await documentsRepo.find({ where: { taxfile_id_fk: id } });
    if (!documents) {
      return res.status(400).json({ message: 'Documents not found' });
    }

    const base_url = process.env.BASE_URL;

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





const geenrateToken = () => {
  return uuidv4();
}