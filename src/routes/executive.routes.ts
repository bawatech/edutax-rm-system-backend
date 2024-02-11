import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus } from "../contollers/executive.controller";
const router = Router();

router.route("/login").post(login);

router.route("/add-executive").post(addExecutive);

router.route("/update-taxfile-status").post(updateTaxfileStatus);

export default router