import { Router } from "express";
import { login, addExecutive, updateTaxfileStatus, addExecutiveMessage, getExecutiveMessages, taxfilesList, taxfileDetail, forgotPassword, newPassword, updatePassword, executivesList, updateExecutiveStatus, addTemplate, templatesList, getTaxfileStatus, taxfilesListWithCount, logout, addExecutiveMsg, getExecutiveMsg, userMsgListCount, updateTaxfileExecutive, createPaymentRequest, verifyPaymentOrder, refreshPaymentOrderStatus, taxfileAddComments, taxfileDeleteComment } from "../contollers/executive.controller";
import { executiveAuth } from "../middlewares/executiveAuth";
import { isAdmin } from "../middlewares/isAdmin";

import multer from 'multer';
import fs from "fs";
import path from "path";

const router = Router();


/////////////////////
//MULTER CODE START HERE
/////////////////////
const uploadDir = path.join(__dirname, '..', '..', 'storage', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalname = file.originalname || 'unknown';;
    const extension = (originalname.split('.').pop() || '').toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return cb(null, JSON.stringify({ error: 'Invalid file type. Only JPG, JPEG, PNG, and PDF files are allowed.' }));
    }
    const fullDate = new Date().toISOString();
    const currentDate = fullDate.slice(0, 10);
    const time = fullDate.split('T')[1].split('.')[0];
    let modifyTime = time.replace(/:/g, '-');
    let randomString = '';
    while (randomString.length < 20) {
      randomString += Math.random().toString(36).substring(2);
    }
    randomString = randomString.substring(0, 20);
    const finalFileName = `${currentDate}-${randomString}-${modifyTime}.${extension}`;
    cb(null, finalFileName);
  }
});
const upload = multer({ storage: storage });
/////////////////////
//MULTER CODE END HERE
/////////////////////



router.route("/login").post(login);
router.post("/logout", logout);
router.route("/forgot-password").post(forgotPassword);
router.route("/new-password").post(newPassword);
router.route("/update-password").put(executiveAuth, updatePassword);



router.route("/taxfile/status").put(executiveAuth, updateTaxfileStatus);
router.route("/taxfile/status").get(executiveAuth, getTaxfileStatus);


router.route("/taxfile/chat").post(executiveAuth, addExecutiveMessage);
router.route("/taxfile/chat/:id").get(executiveAuth, getExecutiveMessages);
router.route("/taxfile-message-count").get(executiveAuth, taxfilesListWithCount);

router.route("/message").post(executiveAuth, addExecutiveMsg);
router.route("/message/:id").get(executiveAuth, getExecutiveMsg);
router.route("/message").get(executiveAuth, userMsgListCount);


router.route("/taxfile").get(executiveAuth, taxfilesList);
router.route("/taxfile/comment/:id").delete(executiveAuth, taxfileDeleteComment);
router.route("/taxfile/:id/add-comment").post(executiveAuth, taxfileAddComments);
router.route("/taxfile/:id").get(executiveAuth, taxfileDetail);

router.put("/taxfile", executiveAuth, upload.any(), updateTaxfileExecutive);



router.route("/add").post(executiveAuth, isAdmin, addExecutive);
router.route("/list").get(executiveAuth, isAdmin, executivesList);
router.route("/status").put(executiveAuth, isAdmin, updateExecutiveStatus);


router.route("/template").post(executiveAuth, isAdmin, addTemplate);
router.route("/template").get(executiveAuth, templatesList);


router.route("/payment/create-request").post(executiveAuth, isAdmin, createPaymentRequest);
router.route("/payment/verify-order/:order_id").post(executiveAuth, isAdmin, verifyPaymentOrder);
router.route("/payment/refresh-order-status/:order_id").post(executiveAuth, isAdmin, refreshPaymentOrderStatus);


export default router