import { NextFunction, Request, Response } from "express";
import { ClientRequest } from "./definationRequest";
import { AppDataSource } from "../AppDataSource";
import { UserLog } from "../entites/UserLog";
export const clientAuth = async (
    req: ClientRequest,
    res: Response,
    next: NextFunction
  ): Promise<Response<any, Record<string, any>> | undefined> => {
    try {


      if(!req.headers.authorization){
        return res.status(401).json({message:'Please provide token'})
      }
      const token = req.headers.authorization.split(' ')[1];

      const userLogRepository = AppDataSource.getRepository(UserLog);
      const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false } });
      if (!userLog) {
        return res.status(401).json({ message: 'Invalid token or token expired' });
      }
      req.CLIENT_ID=userLog.user_id_fk
      next();
    } catch (error) {
      return res.status(401).json({message:'Unable to authanticate'})
    }
  };