import { products } from "../data/products.js";
import { db } from "./connection.js";

export async function seedProducts() {
  const client = await db.connect();
  const now = new Date();

  try {
    await client.query("BEGIN");

    for (const product of products) {
      await client.query(
        `
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
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING
        `,
        [
          product.id,
          product.name,
          product.price,
          product.material,
          product.rating,
          product.reviewCount,
          product.availability,
          now,
          now,
        ],
      );

      for (const [index, image] of product.imageGallery.entries()) {
        await client.query(
          `
            INSERT INTO product_images (
              product_id,
              image_id,
              label,
              src,
              sort_order
            ) VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (product_id, image_id) DO NOTHING
          `,
          [product.id, image.id, image.label, image.src, index],
        );
      }
    }

    await client.query(`
      SELECT setval(
        pg_get_serial_sequence('products', 'id'),
        GREATEST(COALESCE(MAX(id), 1), 1),
        MAX(id) IS NOT NULL
      )
      FROM products
    `);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
