import express, { Router } from "express";
import {
  createProduct,
  deleteProductById,
  getProducts,
  updateProductById,
} from "../controllers/productController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.get("/", getProducts);
router.post("/", requireAdmin, express.json({ limit: "15mb" }), createProduct);
router.put(
  "/:id",
  requireAdmin,
  express.json({ limit: "15mb" }),
  updateProductById,
);
router.delete("/:id", requireAdmin, deleteProductById);

export default router;
