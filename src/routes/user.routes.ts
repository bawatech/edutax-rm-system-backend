import { Router } from "express";
import { profile } from "../contollers/user.controller";


const router = Router();

router.route("/").post((req, res) => {
    res.send(
        { message: 'routes workgin ok' }
    )
});
router.route("/profile").post(profile);

export default router