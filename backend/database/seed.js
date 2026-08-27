import { products } from "../data/products.js";
import { db } from "./connection.js";

export function seedProducts() {
  const productCount = db
    .prepare("SELECT COUNT(*) AS count FROM products")
    .get();

  if (Number(productCount.count) > 0) {
    return;
  }

  const now = new Date().toISOString();
  const insertProduct = db.prepare(`
    INSERT INTO products (
      id,
      name,
      price,
      material,
      rating,
      review_count,
      availability,
      created_at,
      updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertImage = db.prepare(`
    INSERT INTO product_images (
      product_id,
      image_id,
      label,
      src,
      sort_order
    ) VALUES (?, ?, ?, ?, ?)
  `);

  db.exec("BEGIN");

  try {
    for (const product of products) {
      insertProduct.run(
        product.id,
        product.name,
        product.price,
        product.material,
        product.rating,
        product.reviewCount,
        product.availability ? 1 : 0,
        now,
        now,
      );

      product.imageGallery.forEach((image, index) => {
        insertImage.run(
          product.id,
          image.id,
          image.label,
          image.src,
          index,
        );
      });
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
