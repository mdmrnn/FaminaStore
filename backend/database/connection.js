import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configuredDatabasePath = process.env.DATABASE_PATH;
const databasePath = configuredDatabasePath
  ? path.resolve(process.cwd(), configuredDatabasePath)
  : path.join(__dirname, "famina.sqlite");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

export const db = new DatabaseSync(databasePath);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
`);
