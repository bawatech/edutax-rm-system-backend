import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword, updatePassword, executivesList, updateExecutiveStatus, addTemplate, templatesList } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/new-password").post(newPassword);
router.route("/update-password").post(executiveAuth, updatePassword);


// router.route("/update-taxfile-status").post(executiveAuth, );
router.put("/taxfile/status", executiveAuth, updateTaxfileStatus);


router.route("/taxfile/chat").post(executiveAuth, addExecutiveMessage);
router.route("/taxfile/chat/:id").get(executiveAuth, getExecutiveMessages);


router.route("/taxfile").get(executiveAuth, taxfilesList);
router.route("/taxfile/:id").get(executiveAuth, taxfileDetail);



router.route("/add").post(executiveAuth, isAdmin, addExecutive);
router.route("/list").get(executiveAuth, isAdmin, executivesList);
router.route("/status").put(executiveAuth, isAdmin, updateExecutiveStatus);


router.route("/template").post(executiveAuth, isAdmin, addTemplate);
router.route("/template").get(executiveAuth, isAdmin, templatesList);


export default router