import { Router } from "express";
import { acceptSpouseInvitation, addClientMessage, addClientMsg, addTaxfile, getClientMessages, getClientMsg, getDocumentTypes, getMaritalStatus, getProfile, getProvinces, getSpouse, sendSpouseInvitation, taxFileDetails, unlinkSpouse, updateProfile, updateTaxfile, userTaxFileList } from "../contollers/user.controller";
import multer from 'multer';
import fs from "fs";
import path from "path";
import { clientAuth } from "../middlewares/clientAuth";

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
    const currentDate = new Date().toISOString().slice(0, 10);
    let randomString = '';
    while (randomString.length < 20) {
      randomString += Math.random().toString(36).substring(2);
    }
    randomString = randomString.substring(0, 20);
    const finalFileName = `${currentDate}-${randomString}.${extension}`;
    cb(null, finalFileName);
  }
});
const upload = multer({ storage: storage });
/////////////////////
//MULTER CODE END HERE
/////////////////////


router.route("/").post((req, res) => {
  res.send(
    { message: 'routes workgin ok' }
  )
});

router.post("/taxfile", clientAuth, upload.any(), addTaxfile);
router.get("/taxfile", clientAuth, userTaxFileList);
router.get("/taxfile/:id", clientAuth, taxFileDetails);
router.put("/taxfile", clientAuth, upload.any(), updateTaxfile);
//router.route("/upload-documents").post(upload.any(), uploadDocuments);


// router.post("/message", clientAuth, addClientMessage);
// router.get("/message/:id", clientAuth, getClientMessages);

router.post("/message", clientAuth, addClientMsg);
router.get("/message", clientAuth, getClientMsg);



router.put("/profile", clientAuth, updateProfile);
router.get("/profile", clientAuth, getProfile);



router.post("/send-invitation", clientAuth, sendSpouseInvitation);
router.get("/accept-invitation/:token", acceptSpouseInvitation);
router.get("/unlink-spouse", unlinkSpouse);
router.get("/spouse", clientAuth, getSpouse);



router.get("/marital-status", getMaritalStatus);
router.get("/provinces", getProvinces);
router.get("/document-types", getDocumentTypes);


export default router