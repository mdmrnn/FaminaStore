import { db } from "./connection.js";
import { initializeDatabase } from "./schema.js";
import { seedProducts } from "./seed.js";

export function initializeAppDatabase() {
  initializeDatabase();
  seedProducts();
}

export { db };
