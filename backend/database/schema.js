import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.join(__dirname, "migrations");
const migrationLockId = 1_764_082_021;

export async function initializeDatabase() {
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((fileName) => /^\d+_[\w-]+\.sql$/.test(fileName))
    .sort();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1::integer)", [
      migrationLockId,
    ]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migrationFile of migrationFiles) {
      const appliedMigration = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [migrationFile],
      );

      if (appliedMigration.rowCount > 0) {
        continue;
      }

      const migrationSql = await readFile(
        path.join(migrationsDirectory, migrationFile),
        "utf8",
      );

      await client.query(migrationSql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [
        migrationFile,
      ]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
