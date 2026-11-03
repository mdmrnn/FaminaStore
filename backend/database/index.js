import { db } from "./connection.js";
import { initializeDatabase } from "./schema.js";
import { seedProducts } from "./seed.js";

export async function initializeAppDatabase() {
  await initializeDatabase();
  await seedProducts();
}

export { db };
