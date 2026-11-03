import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const environmentFile = path.resolve(__dirname, "..", ".env");

if (typeof process.loadEnvFile === "function" && fs.existsSync(environmentFile)) {
  process.loadEnvFile(environmentFile);
}
