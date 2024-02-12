import { Router } from "express";
import { addClientMessage, addTaxfile, getClientMessages, updateTaxfile, uploadDocuments } from "../contollers/user.controller";
import multer from 'multer';
import fs from "fs";
import path from "path";

const router = Router();


const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage: storage });


router.route("/").post((req, res) => {
  res.send(
    { message: 'routes workgin ok' }
  )
});

router.route("/add-taxfile").post(addTaxfile);
router.route("/update-taxfile").post(updateTaxfile);
router.route("/upload-documents").post(upload.any(), uploadDocuments);
router.route("/add-client-message").post(addClientMessage);
router.route("/get-client-messages").post(getClientMessages);




export default router