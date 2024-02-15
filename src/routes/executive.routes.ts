import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
const router = Router();

router.route("/login").post(login);

router.route("/add-executive").post(addExecutive);

router.route("/update-taxfile-status").post(executiveAuth,updateTaxfileStatus);

router.route("/add-executive-message").post(addExecutiveMessage);

router.route("/get-executive-messages/:id").get(getExecutiveMessages);

router.route("/taxfiles-list").post(taxfilesList);

router.route("/taxfile-detail/:id").get(taxfileDetail);

export default router