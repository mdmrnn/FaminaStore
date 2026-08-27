import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FaminaScarf API is running",
  });
});

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

export default app;
