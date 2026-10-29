import express, { Router } from "express";
import { createProduct, getProducts } from "../controllers/productController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getProducts);
router.post("/", requireAdmin, express.json({ limit: "15mb" }), createProduct);

export default router;
