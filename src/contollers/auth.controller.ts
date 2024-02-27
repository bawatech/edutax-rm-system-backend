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

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || email?.trim() === "" || email?.length <= 0 || !password || password?.trim() === "" || password?.length <= 0) {
    return sendError(res, "Email and Password are required");
  }
  try {
    const user = new User();
    user.email = email;
    user.password = password;
    user.added_on = new Date();
    await requestDataValidation(user);

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;

    const userRepository = AppDataSource.getRepository(User);
    const existingUser: any = await userRepository.findOne({ where: { email: email, verify_status: "PENDING" } });
    let saveNewUser = true;
    if (existingUser) {
      saveNewUser = false;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendEmailVerification(email, otp);

    const token = geenrateToken();
    let newUser = existingUser
    if (saveNewUser == true) {
      user.otp = otp;
      newUser = await userRepository.save(user);

      const userLog = new UserLog();
      userLog.user_id_fk = newUser.id;
      userLog.key = token;
      const userLogRepository = AppDataSource.getRepository(UserLog);
      await userLogRepository.save(userLog);
    } else {
      existingUser.otp = otp;
      await userRepository.update(existingUser.id, existingUser);
    }

    return sendSuccess(res, "Signed up successfully. Please verify your Email", { token, user:newUser }, 201);

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

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email, id_status: "ACTIVE" } });
    if (!user) {
      return sendError(res, "Invalid email");
    }
    // if (user.password !== password) {
    //   return sendError(res, "Invalid password");
    // }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return sendError(res, "Invalid password");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await sendLoginVerification(email, otp);

    user.otp = otp;
    const newOtp = await userRepository.update(user.id, user);

    if (!newOtp) {
      return sendError(res, "Unable to set Otp");
    }

    // const token = geenrateToken();
    // const userLog = new UserLog();
    // userLog.user_id_fk = user.id;
    // userLog.key = token;
    // userLog.added_on = new Date();
    // const userLogRepository = AppDataSource.getRepository(UserLog);
    // await userLogRepository.save(userLog);
    // const profileRepo = AppDataSource.getRepository(Profile)
    // const profile = profileRepo.findOne({ where: { user: { id: user?.id } } })

    return sendSuccess(res, "LoggedIn successfully.Please Verify using Otp", {email});
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
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { otp:otp, email: email, id_status: "ACTIVE", is_deleted: false } });
    if (!user) {
      return sendError(res, "Wrong Otp")
    }

    user.otp = '';
    const user_id = user.id;
    await userRepository.update(user.id, user);

    const token = geenrateToken();
    const userLog = new UserLog();
    userLog.user_id_fk = user_id;
    userLog.key = token;
    userLog.added_on = new Date();
    const userLogRepository = AppDataSource.getRepository(UserLog);
    await userLogRepository.save(userLog);
    const profileRepo = AppDataSource.getRepository(Profile)
    const profile = await profileRepo.findOne({ where: { user: { id: user?.id } },relations: ['marital_status_detail', 'province_detail'] })

    return sendSuccess(res, "Logged In Successfully", { token, user, profile }, 201);


  } catch (e) {
    return handleCatch(res, e);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { email , otp } = req.body;

  if (!email || email?.trim() === "" || email?.length <= 0) {
    return sendError(res, "Email is required");
  }

  if (!otp) {
    return sendError(res, "Please provide otp")
  }

  try {
    const userId = req?.userId;
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { otp: otp, email: email, id: userId, verify_status: "PENDING", id_status: "ACTIVE" } });
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
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email, id_status: "ACTIVE" } });
    if (user) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await sendForgetPasswordOtp(email, otp);
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
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { email: email, otp: otp, id_status: "ACTIVE" } });
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

