import { Router } from "express";
import {
  getAvailablePaymentMethods,
  zarinpalCallback,
} from "../controllers/paymentController.js";

const router = Router();

router.get("/methods", getAvailablePaymentMethods);
router.get("/zarinpal/callback", zarinpalCallback);

export default router;
