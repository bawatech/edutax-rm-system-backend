import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
const router = Router();

router.route("/login").post(login);

router.route("/add-executive").post(addExecutive);

router.route("/update-taxfile-status").post(executiveAuth,updateTaxfileStatus);

router.route("/add-executive-message").post(executiveAuth,addExecutiveMessage);

router.route("/get-executive-messages/:id").get(executiveAuth,getExecutiveMessages);

router.route("/taxfiles-list").post(executiveAuth,taxfilesList);

router.route("/taxfile-detail/:id").get(executiveAuth,taxfileDetail);

router.route("/forgot-password").post(forgotPassword);

router.route("/new-password").post(newPassword);

// router.route("/update-password").post(executiveAuth,updatePassword);

// router.route("/executives-list").post(executivesList);

// router.route("/update-executive-status/:id").get(updateExecutiveStatus);


export default router