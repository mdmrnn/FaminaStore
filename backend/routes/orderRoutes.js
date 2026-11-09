import { Router } from "express";
import {
  createOrder,
  createZarinpalPayment,
  getOrderPayment,
  verifyOrderPaymentController,
} from "../controllers/orderController.js";
import {
  createOrderLimiter,
  paymentLimiter,
} from "../middleware/rateLimits.js";

const router = Router();

router.post("/", createOrderLimiter, createOrder);
router.post("/:orderId/payment", paymentLimiter, createZarinpalPayment);
router.get("/:orderId/payment-status", paymentLimiter, getOrderPayment);
router.post(
  "/:orderId/payment/verify",
  paymentLimiter,
  verifyOrderPaymentController,
);

export default router;
