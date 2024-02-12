import { Request, Response } from 'express';
import { User } from '../entites/User';
import { UserLog } from '../entites/UserLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { handleCatch, requestDataValidation, sendError, sendSuccess } from '../utils/responseHanlder';
import { sendEmail } from '../utils/sendMail';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = new User();
    user.email = email;
    user.password = password;

    await requestDataValidation(user)
    const userRepository = AppDataSource.getRepository(User);
    const subject = "Edutax: Verify Email Address";
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const message = "<h1>Please use the Given OTP to verify Your Email Address</h1><br><br>OTP: " + otp;
    await sendEmail(email, subject, message);
    user.otp = otp;
    await userRepository.save(user);
    return sendSuccess(res, "Signed up successfully. Please verify your Email", { user }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};




export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      return sendError(res, "Invalid email");
    }
    if (user.password !== password) {
      return sendError(res, "Invalid password");
    }

    const token = geenrateToken();
    const userLog = new UserLog();
    userLog.user_id_fk = user.id;
    userLog.key = token;
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);

    return sendSuccess(res, "LoggedIn successfully", { token });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email, otp: otp } });
    if (user) {
      user.otp = '';
      user.verify_status = 'VERIFIED';
      //await userRepository.save(user);
      await userRepository.update(user.id, user);

      return sendSuccess(res, "Email Verified Successfully", { user }, 201);
    } else {
      return sendError(res, "Wrong Email or Otp");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email } });
    if (user) {
      const subject = "Edutax: Forgot Pasword";
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const message = "<h1>Please use the Given OTP for New Password</h1><br><br>OTP: " + otp;
      await sendEmail(email, subject, message);
      user.otp = otp;
      // await userRepository.save(user);
      await userRepository.update(user.id, user);

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
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email, otp: otp } });
    if (user) {
      user.password = newPassword;
      user.otp = '';
      // await userRepository.save(user);
      await userRepository.update(user.id, user);

      return sendSuccess(res, "Password Changed Successfully", {}, 201);
    } else {
      return sendError(res, "Wrong Email/Otp");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { oldPassword, newPassword, token } = req.body;
  try {
    const userLogRepository = AppDataSource.getRepository(UserLog);
    const userLog = await userLogRepository.findOne({ where: { key: token, is_deleted: false } });
    if (!userLog) {
      return res.status(400).json({ message: 'Invalid token or token expired' });
    }
    const userId = userLog.user_id_fk;

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId, password: oldPassword } });
    if (user) {
      user.password = newPassword;
      // await userRepository.save(user);
      await userRepository.update(user.id, user);

      return sendSuccess(res, "Password Updated Successfully", {}, 201);
    } else {
      return sendError(res, "Wrong Old Password");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};






const geenrateToken = () => {
  return uuidv4();
}

