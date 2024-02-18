import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword, updatePassword, executivesList, updateExecutiveStatus, addTemplate, templatesList } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

router.route("/login").post(login);

router.route("/update-taxfile-status").post(executiveAuth, updateTaxfileStatus);

router.route("/taxfile/chat").post(executiveAuth, addExecutiveMessage);

router.route("/taxfile/chat/:id").get(executiveAuth, getExecutiveMessages);

router.route("/taxfiles-list").post(executiveAuth, taxfilesList);

router.route("/taxfile-detail/:id").get(executiveAuth, taxfileDetail);

router.route("/forgot-password").post(forgotPassword);

router.route("/new-password").post(newPassword);

router.route("/update-password").post(executiveAuth, updatePassword);




////////////////////////
//ROUTES FOR ADMIN //START HERE
////////////////////////

router.route("/add-executive").post(executiveAuth, isAdmin, addExecutive);

router.route("/executives-list").post(executiveAuth, isAdmin, executivesList);

router.route("/update-executive-status").post(executiveAuth, isAdmin, updateExecutiveStatus);

router.route("/add-template").post(executiveAuth, isAdmin, addTemplate);

router.route("/templates-list").post(executiveAuth, isAdmin, templatesList);


export default router