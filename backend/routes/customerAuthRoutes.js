import { Router } from "express";
import {
  getCurrentCustomer,
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "../controllers/customerAuthController.js";
import {
  requireCustomer,
  requireTrustedRequestOrigin,
} from "../middleware/customerAuth.js";
import { customerAuthLimiter } from "../middleware/rateLimits.js";

const router = Router();

router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});

router.post(
  "/register",
  requireTrustedRequestOrigin,
  customerAuthLimiter,
  registerCustomer,
);
router.post(
  "/login",
  requireTrustedRequestOrigin,
  customerAuthLimiter,
  loginCustomer,
);
router.get("/me", requireCustomer, getCurrentCustomer);
router.post("/logout", requireTrustedRequestOrigin, logoutCustomer);

export default router;
