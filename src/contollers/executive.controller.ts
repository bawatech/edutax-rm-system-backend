import { Request, Response } from 'express';
import { Executive } from '../entites/Executive';
import { ExecutiveLog } from '../entites/ExecutiveLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { validate } from 'class-validator';
import { Taxfile } from '../entites/Taxfile';
import { TaxfileStatus } from '../entites/TaxfileStatus';
import { TaxfileStatusLog } from '../entites/TaxfileStatusLog';



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

    const token = uuidv4();

    const executiveLog = new ExecutiveLog();
    executiveLog.executive_id_fk = executive.id;
    executiveLog.key = token;
    //executiveLog.ulog_privs = 'ADMIN';

    const userLogRepository = AppDataSource.getRepository(ExecutiveLog);
    await userLogRepository.save(executiveLog);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(400).json({ message: 'Something went wrong', error });
  }
};



export const addExecutive = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const executive = new Executive();
  executive.email = email;
  executive.password = password;

  try {

    const errors = await validate(executive);
    if (errors.length > 0) {
      const errorMessages = errors.map(error => {
        if (error.constraints) {
          return Object.values(error.constraints);
        }
        return [];
      }).flat();
      return res.status(400).json({ message: 'Invalid executive data', errors: errorMessages });
    }


    const executiveRepository = AppDataSource.getRepository(Executive);
    const existingUser = await executiveRepository.findOne({ where: { email: executive.email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Executive with this email already exists' });
    }


    await executiveRepository.save(executive);

    res.status(201).json({ message: 'Executive Added successfully', executive });
  } catch (error) {
    console.error('Error during process:', error);
    res.status(400).json({ message: 'Something went wrong', error });
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
    await taxfileRepository.save(taxfile);

    res.status(200).json({ message: 'Taxfile Status updated successfully', taxfile });
  } catch (error) {
    console.error('Error during taxfile update:', error);
    res.status(500).json({ message: 'Something went wrong', error });
  }
};