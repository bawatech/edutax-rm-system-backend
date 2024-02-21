import { Router } from "express";
import { login, signUp, verifyEmail, forgotPassword, newPassword, updatePassword, logout } from "../contollers/auth.controller";
import { clientAuth } from "../middlewares/clientAuth";
const router = Router();



router.post("/sign-up", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/new-password", newPassword);
router.put("/update-password", clientAuth, updatePassword);


export default router