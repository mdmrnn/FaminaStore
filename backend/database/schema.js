import { db } from "./connection.js";

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL CHECK (price >= 0),
      material TEXT NOT NULL,
      rating REAL NOT NULL DEFAULT 0 CHECK (rating >= 0),
      review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
      availability INTEGER NOT NULL DEFAULT 1
        CHECK (availability IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      src TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      UNIQUE (product_id, image_id),
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_product_images_product_id
      ON product_images(product_id);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      mobile TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      delivery_note TEXT,
      shipping_method TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
      shipping_cost INTEGER NOT NULL CHECK (shipping_cost >= 0),
      total INTEGER NOT NULL CHECK (total >= 0),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
      total_price INTEGER NOT NULL CHECK (total_price >= 0),
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id);
  `);
}
