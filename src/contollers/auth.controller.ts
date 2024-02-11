import { Request, Response } from 'express';
import { User } from '../entites/User';
import { UserLog } from '../entites/UserLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { handleCatch, requestDataValidation, sendError, sendSuccess } from '../utils/responseHanlder';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = new User();
  user.email = email;
  user.password = password;

  try {

    await requestDataValidation(user)
    const userRepository = AppDataSource.getRepository(User);
    await userRepository.save(user);
    return sendSuccess(res,"Signed up successfully",{user},201);

  } catch (e) {
    return handleCatch(res,e);
  }
};




export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return sendError(res,"Invalid email");
    }
    if (user.password !== password) {
      return sendError(res,"Invalid password");
    }

    const token = geenrateToken();
    const userLog = new UserLog();
    userLog.ulog_user_id_fk = user.id;
    userLog.ulog_key = token;
    userLog.ulog_id_status = 'ACT';
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);

    return sendSuccess(res,"Signed up successfully",{token});
  } catch (e) {
    return handleCatch(res,e);
  }
};

const geenrateToken = () =>{
  return uuidv4();
}