import { Router } from "express";
import { webhookStripe } from "../contollers/webhook.controller";
const router = Router();

router.post("/stripe", webhookStripe);


export default router