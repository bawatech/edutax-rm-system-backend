import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages } from "../contollers/executive.controller";
const router = Router();

router.route("/login").post(login);

router.route("/add-executive").post(addExecutive);

router.route("/update-taxfile-status").post(updateTaxfileStatus);

router.route("/add-executive-message").post(addExecutiveMessage);
router.route("/get-executive-messages").post(getExecutiveMessages);

export default router