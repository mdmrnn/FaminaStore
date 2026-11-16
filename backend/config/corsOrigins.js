import "./env.js";

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

export const allowedOrigins = new Set(
  configuredOrigins.length > 0 ? configuredOrigins : defaultDevelopmentOrigins,
);
