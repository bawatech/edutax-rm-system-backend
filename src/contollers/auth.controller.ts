import { Request, Response } from 'express';
import { User } from '../entites/User';
import { UserLog } from '../entites/UserLog';
import { AppDataSource } from '../AppDataSource';
import { v4 as uuidv4 } from 'uuid';
import { handleCatch, requestDataValidation, sendError, sendSuccess } from '../utils/responseHanlder';
import { sendEmail } from '../utils/sendMail';
import { Profile } from '../entites/Profile';
import bcrypt from 'bcrypt';
import { sendEmailVerification, sendForgetPasswordOtp, sendLoginVerification } from '../services/EmailManager';
import { dec, enc } from '../utils/commonFunctions';

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0 || !password || password?.trim() === "" || password?.length <= 0) {
    return sendError(res, "Email and Password are required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    const user = new User();
    user.email = lowerCaseEmail;
    user.password = password;
    user.added_on = new Date();
    await requestDataValidation(user);

    let enc_email = enc(lowerCaseEmail);
    user.email = enc_email;

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    const userRepository = AppDataSource.getRepository(User);
    const existingUser: any = await userRepository.findOne({ where: { email: enc_email } });
    let saveNewUser = true;
    if (existingUser) {
      if (existingUser?.verify_status == 'VERIFIED') {
        return sendError(res, "This email has been already used");
      }
      saveNewUser = false;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sendEmailVerification(lowerCaseEmail, otp);

    const token = geenrateToken();
    let userData = existingUser;
    if (saveNewUser == true) {
      user.otp = otp;
      userData = await userRepository.save(user);

      if (!userData) {
        return sendError(res, "Unable to Signup");
      }

    } else {
      existingUser.otp = otp;
      await userRepository.update(existingUser.id, existingUser);
    }
    const userLog = new UserLog();
    userLog.user_id_fk = userData.id;
    userLog.key = token;
    userLog.added_on = new Date();
    userLog.added_by = userData.id;
    userLog.last_activity_on = new Date();
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);


    userData.email = dec(userData.email);

    if ('otp' in userData) {
      delete (userData as any).otp;
    }
    if ('password' in userData) {
      delete (userData as any).password;
    }


    return sendSuccess(res, "Signed up successfully. Please verify your Email", { token, user: userData }, 201);

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const resendSignupOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE", is_deleted: false, verify_status: "PENDING" } });
    if (!user) {
      return sendError(res, "Invalid email/Already Verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sendEmailVerification(lowerCaseEmail, otp);

    user.otp = otp;
    const newOtp = await userRepository.update(user.id, user);

    if (!newOtp) {
      return sendError(res, "Unable to set Otp");
    }

    return sendSuccess(res, "Otp sent again Successfully", { email: lowerCaseEmail });
  } catch (e) {
    return handleCatch(res, e);
  }
};


export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0 || !password || password?.trim() === "" || password?.length <= 0) {
    return sendError(res, "Email and Password are required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "Invalid email");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendError(res, "Invalid password");
    }

    const user_id = user.id;

    const token = geenrateToken();
    const userLog = new UserLog();
    userLog.user_id_fk = user_id;
    userLog.key = token;
    userLog.added_on = new Date();
    userLog.last_activity_on = new Date();
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);
    const profileRepo = AppDataSource.getRepository(Profile)
    const profile = await profileRepo.findOne({ where: { user: { id: user?.id } }, relations: ['marital_status_detail', 'province_detail'] });

    user.email = dec(user.email);
    if (profile) {
      profile.mobile_number = dec(profile.mobile_number);
    }

    return sendSuccess(res, "LoggedIn successfully", { token, user, profile }, 201);
  } catch (e) {
    return handleCatch(res, e);
  }
};


// export const login = async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   if (!email || email?.trim() === "" || email?.length <= 0 || !password || password?.trim() === "" || password?.length <= 0) {
//     return sendError(res, "Email and Password are required");
//   }
//   try {
//     const lowerCaseEmail = email.toLowerCase();
//     let enc_email = enc(lowerCaseEmail);
//     const userRepository = AppDataSource.getRepository(User);
//     const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE" } });
//     if (!user) {
//       return sendError(res, "Invalid email");
//     }

//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return sendError(res, "Invalid password");
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     sendLoginVerification(lowerCaseEmail, otp);

//     user.otp = otp;
//     const newOtp = await userRepository.update(user.id, user);

//     if (!newOtp) {
//       return sendError(res, "Unable to set Otp");
//     }

//     return sendSuccess(res, "LoggedIn successfully.Please Verify using Otp", { email: lowerCaseEmail });
//   } catch (e) {
//     return handleCatch(res, e);
//   }
// };

export const resendLoginOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "Invalid email");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sendLoginVerification(lowerCaseEmail, otp);

    user.otp = otp;
    const newOtp = await userRepository.update(user.id, user);

    if (!newOtp) {
      return sendError(res, "Unable to set Otp");
    }

    return sendSuccess(res, "Otp sent again Successfully", { email: lowerCaseEmail });
  } catch (e) {
    return handleCatch(res, e);
  }
};

export const verifyLogin = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email) {
    return sendError(res, "Please provide Email")
  }

  if (!otp) {
    return sendError(res, "Please provide Otp")
  }

  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { otp: otp, email: enc_email, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "Wrong Otp")
    }

    user.otp = '';
    user.verify_status = 'VERIFIED';
    const user_id = user.id;
    await userRepository.update(user.id, user);

    const token = geenrateToken();
    const userLog = new UserLog();
    userLog.user_id_fk = user_id;
    userLog.key = token;
    userLog.added_on = new Date();
    userLog.last_activity_on = new Date();
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);
    const profileRepo = AppDataSource.getRepository(Profile)
    const profile = await profileRepo.findOne({ where: { user: { id: user?.id } }, relations: ['marital_status_detail', 'province_detail'] });

    user.email = dec(user.email);
    if (profile) {
      profile.mobile_number = dec(profile.mobile_number);
    }

    return sendSuccess(res, "Logged In Successfully", { token, user, profile }, 201);


  } catch (e) {
    return handleCatch(res, e);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }

  if (!otp) {
    return sendError(res, "Please provide otp")
  }

  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);

    const userId = req?.userId;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { otp: otp, email: enc_email, verify_status: "PENDING", id_status: "ACTIVE" } });
    if (user) {
      user.otp = '';
      user.verify_status = 'VERIFIED';
      //await userRepository.save(user);
      const verified = await userRepository.update(user.id, user);
      if (!verified) {
        return sendError(res, "Verification Failed");
      }

      const token = geenrateToken();
      const userLog = new UserLog();
      userLog.user_id_fk = user?.id;
      userLog.key = token;
      userLog.added_on = new Date();
      userLog.added_by = user?.id;
      userLog.last_activity_on = new Date();
      const userLogRepository = AppDataSource.getRepository(UserLog);
      await userLogRepository.save(userLog);


      return sendSuccess(res, "Email Verified Successfully", { token, user }, 201);
    } else {
      return sendError(res, "Wrong Email or Otp");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const logout = async (req: Request, res: Response) => {
  const userId = req?.userId;
  const execToken = req?.execToken;
  try {
    const userLogRepo = AppDataSource.getRepository(UserLog);
    const logoutStatus: any = await userLogRepo.findOne({ where: { key: execToken, user_id_fk: userId } });
    logoutStatus.id_status = "INACTIVE";
    logoutStatus.is_deleted = true;
    await userLogRepo.update(logoutStatus.id, logoutStatus);

    return sendSuccess(res, "Logged out Successfully", {}, 200);

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
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE", is_deleted: false } });
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sendForgetPasswordOtp(lowerCaseEmail, otp);
      user.otp = otp;
      await userRepository.update(user.id, user);

      return sendSuccess(res, "OTP Sent Successfully on Registered Email", {}, 201);
    } else {
      return sendError(res, "Wrong Email");
    }

  } catch (e) {
    return handleCatch(res, e);
  }
};

export const resendForgotPassOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }
  try {
    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "Invalid email/Already Verified");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    sendForgetPasswordOtp(lowerCaseEmail, otp);

    user.otp = otp;
    const newOtp = await userRepository.update(user.id, user);

    if (!newOtp) {
      return sendError(res, "Unable to set Otp");
    }

    return sendSuccess(res, "Otp sent again Successfully", { email: lowerCaseEmail });
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
    if (newPassword?.length < 8 || newPassword?.length > 20) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }
    if (!/\d/.test(newPassword)) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }
    if (!/[#@!$%&]/.test(newPassword)) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }

    const lowerCaseEmail = email.toLowerCase();
    let enc_email = enc(lowerCaseEmail);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: enc_email, otp: otp, id_status: "ACTIVE" } });
    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      // user.password = newPassword;
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

// export const updatePassword = async (req: ClientRequest, res: Response) => {
export const updatePassword = async (req: Request, res: Response) => {

  const userId = req?.userId;

  const { oldPassword, newPassword } = req.body;
  if (!newPassword) {
    return sendError(res, "New Password is required");
  }

  try {

    if (newPassword.length < 8 || newPassword.length > 20) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }
    if (!/\d/.test(newPassword)) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }
    if (!/[#@!$%&]/.test(newPassword)) {
      return sendError(res, "Password must be between 8 and 20 characters long, and contain at least one numeric value and one symbol from #,@,!,$,%,&");
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: userId, id_status: "ACTIVE" } });
    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      //user.password = newPassword;
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

