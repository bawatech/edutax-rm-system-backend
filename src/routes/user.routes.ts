import { Router } from "express";
import { addTaxfile, updateTaxfile, uploadDocuments } from "../contollers/user.controller";
import multer from 'multer';
import fs from "fs";
import path from "path";

const router = Router();


// Define the directory path for uploads
const uploadDir = path.join(__dirname, 'uploads');

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Define storage for Multer
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

//  router.route("/upload-documents").post(upload.array('documents', 10), uploadDocuments);

// router.route("/upload-documents").post(upload.fields([{ name: 'documents', maxCount: 10 }, { name: 'typeIds', maxCount: 10 }]), uploadDocuments);

router.route("/upload-documents").post((req, res, next) => {
  upload.array('documents', 10)(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ message: 'Multer error', error: err });
    }
    next();
  });
}, uploadDocuments);

  


export default router