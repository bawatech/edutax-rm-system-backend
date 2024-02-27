import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword, updatePassword, executivesList, updateExecutiveStatus, addTemplate, templatesList, getTaxfileStatus, taxfilesListWithCount, logout, addExecutiveMsgAll, getExecutiveMsgAll, userListWithCount } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

router.route("/login").post(login);
router.post("/logout", logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/new-password").post(newPassword);
router.route("/update-password").put(executiveAuth, updatePassword);



router.route("/taxfile/status").put(executiveAuth, updateTaxfileStatus);
router.route("/taxfile/status").get(executiveAuth, getTaxfileStatus);


router.route("/taxfile/chat").post(executiveAuth, addExecutiveMessage);
router.route("/taxfile/chat/:id").get(executiveAuth, getExecutiveMessages);

router.route("/taxfile/chat-all").post(executiveAuth, addExecutiveMsgAll);
router.route("/taxfile/chat-all/:id").get(executiveAuth, getExecutiveMsgAll);


router.route("/taxfile").get(executiveAuth, taxfilesList);
router.route("/taxfile/:id").get(executiveAuth, taxfileDetail);
router.route("/taxfile-message-count").get(executiveAuth, taxfilesListWithCount);
router.route("/user-message-count").get(executiveAuth, userListWithCount);


router.route("/add").post(executiveAuth, isAdmin, addExecutive);
router.route("/list").get(executiveAuth, isAdmin, executivesList);
router.route("/status").put(executiveAuth, isAdmin, updateExecutiveStatus);


router.route("/template").post(executiveAuth, isAdmin, addTemplate);
router.route("/template").get(executiveAuth, templatesList);


export default router