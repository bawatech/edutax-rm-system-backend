import { Router } from "express";
import { login, signUp, verifyEmail, forgotPassword, newPassword, updatePassword } from "../contollers/auth.controller";
import { clientAuth } from "../middlewares/ClientAuthMiddleware";
const router = Router();



router.post("/sign-up", signUp);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/new-password", newPassword);
router.post("/update-password", updatePassword);
// router.post("/update-password", clientAuth, updatePassword);

export default router