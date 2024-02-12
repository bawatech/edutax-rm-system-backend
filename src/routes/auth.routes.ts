import { Router } from "express";
import { login, signUp, verifyEmail, forgotPassword, newPassword, updatePassword } from "../contollers/auth.controller";
const router = Router();

router.route("/sign-up").post(signUp);
router.route("/login").post(login);
router.route("/verify-email").post(verifyEmail);
router.route("/forgot-password").post(forgotPassword);
router.route("/new-password").post(newPassword);
router.route("/update-password").post(updatePassword);

export default router