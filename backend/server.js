import "./config/env.js";
import app from "./app.js";
import { db, initializeAppDatabase } from "./database/index.js";

const PORT = Number.parseInt(process.env.PORT ?? "5000", 10);

if (
  process.env.NODE_ENV === "production" &&
  (!process.env.ADMIN_USERNAME || (process.env.ADMIN_PASSWORD?.length ?? 0) < 24)
) {
  throw new Error(
    "Production requires ADMIN_USERNAME and an ADMIN_PASSWORD of at least 24 characters.",
  );
}

try {
  await initializeAppDatabase();
} catch (error) {
  console.error("Database initialization failed:", error.message);
  await db.end();
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`FaminaScarf API is listening on port ${PORT}`);
});

async function shutdown(signal) {
  console.log(`${signal} received; closing the API and database pool.`);
  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
