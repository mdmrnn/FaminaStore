import "./config/env.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { uploadsDirectory } from "./config/paths.js";
import adminRoutes from "./routes/adminRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDevelopmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];
const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (process.env.NODE_ENV === "production" && configuredOrigins.length === 0) {
  throw new Error("Set CORS_ORIGINS to the deployed storefront origin.");
}

const allowedOrigins = new Set(
  configuredOrigins.length > 0
    ? configuredOrigins
    : defaultDevelopmentOrigins,
);
const trustProxyHops = Number.parseInt(process.env.TRUST_PROXY_HOPS ?? "0", 10);

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
}

app.set("trust proxy", trustProxyHops);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.use("/api/products", productRoutes);
app.use("/api/admin", express.json({ limit: "16kb" }), adminRoutes);
app.use(
  "/api/orders",
  express.json({ limit: "64kb" }),
  orderRoutes,
);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDirectory));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FaminaScarf API is running",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status >= 500) {
    console.error("Unhandled API request error:", error.message);
  }

  return res.status(status).json({
    success: false,
    error:
      status === 413
        ? "حجم درخواست بیش از حد مجاز است."
        : status < 500
          ? "درخواست معتبر نیست."
          : "خطای داخلی سرور.",
  });
});

export default app;
