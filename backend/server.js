import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { products } from "./data/products.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static assets from backend/public under the /public URL path
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FaminaScarf API is running",
  });
});

/**
 * Get all products
 * GET: http://localhost:5000/api/products
 */
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

app.listen(PORT, () => {
  console.log(`FaminaScarf API running on http://localhost:${PORT}`);
});
