import { Router } from "express";
import { createOrder } from "../controllers/orderController.js";
import { createOrderLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.post("/", createOrderLimiter, createOrder);

export default router;
