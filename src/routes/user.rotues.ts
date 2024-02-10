import { Router } from "express";
import { protect } from "../middlewares/AuthMiddleware";
const router = Router();

router.route("/").post( (req, res)=>{
res.send(
    {message:'routes workgin ok'}
)
});

export default router