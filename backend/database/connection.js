import pg from "pg";
import "../config/env.js";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;
const requiredPgSettings = ["PGHOST", "PGDATABASE", "PGUSER", "PGPASSWORD"];

if (
  !databaseUrl &&
  requiredPgSettings.some((setting) => !process.env[setting])
) {
  throw new Error(
    "Configure DATABASE_URL or PGHOST, PGDATABASE, PGUSER, and PGPASSWORD before starting the API.",
  );
}

const poolOptions = {
  max: Number.parseInt(process.env.PGPOOL_MAX ?? "5", 10),
  connectionTimeoutMillis: 5_000,
  idleTimeoutMillis: 30_000,
};

if (databaseUrl) {
  poolOptions.connectionString = databaseUrl;
} else {
  poolOptions.host = process.env.PGHOST;
  poolOptions.port = Number.parseInt(process.env.PGPORT ?? "5432", 10);
  poolOptions.database = process.env.PGDATABASE;
  poolOptions.user = process.env.PGUSER;
  poolOptions.password = process.env.PGPASSWORD;
}

if (process.env.DATABASE_SSL?.toLowerCase() === "true") {
  poolOptions.ssl = { rejectUnauthorized: true };
}

export const db = new Pool(poolOptions);

db.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});
