import { Router } from "express";
import { login, signUp, verifyEmail, forgotPassword, newPassword, updatePassword, logout, verifyLogin } from "../contollers/auth.controller";
import { clientAuth } from "../middlewares/clientAuth";
import { validateForgotPass, validateLogin, validateNewPass, validateSignup, validateUpdatePass, validateVerifyEmail, validateVerifyLogin } from "../utils/validate";


const router = Router();



router.post("/sign-up", validateSignup, signUp);
router.post("/login", validateLogin, login);
router.post("/logout", logout);
router.post("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/verify-login", validateVerifyLogin, verifyLogin);
router.post("/forgot-password", validateForgotPass, forgotPassword);
router.post("/new-password", validateNewPass, newPassword);
router.put("/update-password", validateUpdatePass, clientAuth, updatePassword);


export default router