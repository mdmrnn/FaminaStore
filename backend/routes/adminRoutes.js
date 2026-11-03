import { Router } from "express";
import {
  getOrders,
  markOrderPaid,
  updateOrderStatus,
} from "../controllers/adminOrderController.js";
import { loginAdmin, logoutAdmin, requireAdmin } from "../middleware/adminAuth.js";
import { adminLoginLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.post("/login", adminLoginLimiter, loginAdmin);
router.post("/logout", requireAdmin, logoutAdmin);
router.get("/orders", requireAdmin, getOrders);
router.patch("/orders/:orderId/status", requireAdmin, updateOrderStatus);
router.patch("/orders/:orderId/payment", requireAdmin, markOrderPaid);

export default router;
