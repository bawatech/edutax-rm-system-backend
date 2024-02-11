import { Router } from "express";
import { addTaxfile, updateTaxfile } from "../contollers/user.controller";


const router = Router();

router.route("/").post((req, res) => {
    res.send(
        { message: 'routes workgin ok' }
    )
});
router.route("/add-taxfile").post(addTaxfile);
router.route("/update-taxfile").post(updateTaxfile);

export default router