import { Router } from "express";
const router = Router();

router.route("/").post( (req, res)=>{
res.send(
    {message:'routes workgin ok'}
)
});

export default router