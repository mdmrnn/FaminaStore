import { Router } from "express";
import { loginAdmin, logoutAdmin, requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", requireAdmin, logoutAdmin);

export default router;
