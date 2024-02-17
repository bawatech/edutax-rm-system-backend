import { Router } from "express";
import { addClientMessage, addTaxfile, createProfile, getClientMessages, getDocumentTypes, getMaritalStatus, getProvinces, taxFileDetails, updateTaxfile } from "../contollers/user.controller";
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
    // cb(null, file.originalname.replace(/\s+/g, '-'));
    const originalname = file.originalname;
    const extension = originalname.split('.').pop();
    const originalNameWithoutExtension = originalname.substring(0, originalname.lastIndexOf('.'));
    const nameWithoutSpaces = originalNameWithoutExtension.replace(/\s+/g, '-');
    const currentDate = new Date().toISOString().slice(0, 10);
    const currentTime = new Date().toISOString().slice(11, 16).replace(':', '-');
    const randomString = Math.random().toString(36).substring(2, 8);
    const finalFileName = `${nameWithoutSpaces}-${currentDate}-${currentTime}-${randomString}.${extension}`;
    cb(null, finalFileName);
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
router.route("/update-taxfile").post(clientAuth, updateTaxfile);
router.route("/taxfile-details/:id").get(clientAuth, taxFileDetails);
//router.route("/upload-documents").post(upload.any(), uploadDocuments);
router.route("/add-client-message").post(clientAuth, addClientMessage);

// router.post("/get-client-messages", clientAuth, getClientMessages);
router.route("/get-client-messages/:id").get(clientAuth, getClientMessages);

router.post("/create-profile", clientAuth, createProfile);



////////////////////////
//ROUTES FOR MASTERS //START HERE
////////////////////////
router.route("/get-marital-status").get(getMaritalStatus);

router.route("/get-provinces").get(getProvinces);

router.route("/get-document-types").get(getDocumentTypes);

export default router