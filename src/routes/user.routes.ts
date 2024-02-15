import { Router } from "express";
import { addClientMessage, addTaxfile, createProfile, getClientMessages, taxFileDetails, updateTaxfile } from "../contollers/user.controller";
import multer from 'multer';
import fs from "fs";
import path from "path";
import { clientAuth } from "../middlewares/clientAuth";

const router = Router();


const uploadDir = path.join(__dirname, '..', '..', 'storage', 'documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

router.post("/add-taxfile", clientAuth, upload.any(), addTaxfile);
//router.route("/add-taxfile").post(upload.any(), addTaxfile);
router.route("/update-taxfile").post(clientAuth,updateTaxfile);
router.route("/taxfile-details/:id").get(clientAuth, taxFileDetails);
//router.route("/upload-documents").post(upload.any(), uploadDocuments);
router.route("/add-client-message").post(clientAuth,addClientMessage);

// router.post("/get-client-messages", clientAuth, getClientMessages);
router.route("/get-client-messages/:id").get(clientAuth, getClientMessages);

router.post("/create-profile", clientAuth, createProfile);


export default router