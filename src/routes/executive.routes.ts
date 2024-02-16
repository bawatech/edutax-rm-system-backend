import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword, updatePassword, executivesList, updateExecutiveStatus, addTemplate, templatesList } from "../contollers/executive.controller";
import { adminAuth } from "../middlewares/adminAuth";
import { executiveAuth } from "../middlewares/executiveAuth";

const router = Router();

router.route("/login").post(login);

router.route("/update-taxfile-status").post(executiveAuth, updateTaxfileStatus);

router.route("/add-executive-message").post(executiveAuth, addExecutiveMessage);

router.route("/get-executive-messages/:id").get(executiveAuth, getExecutiveMessages);

router.route("/taxfiles-list").post(executiveAuth, taxfilesList);

router.route("/taxfile-detail/:id").get(executiveAuth, taxfileDetail);

router.route("/forgot-password").post(forgotPassword);

router.route("/new-password").post(newPassword);

router.route("/update-password").post(executiveAuth, updatePassword);




////////////////////////
//ROUTES FOR ADMIN //START HERE
////////////////////////

router.route("/add-executive").post(adminAuth, addExecutive);

router.route("/executives-list").post(adminAuth, executivesList);

router.route("/update-executive-status").post(adminAuth, updateExecutiveStatus);

router.route("/add-template").post(adminAuth, addTemplate);

router.route("/templates-list").post(adminAuth, templatesList);


export default router