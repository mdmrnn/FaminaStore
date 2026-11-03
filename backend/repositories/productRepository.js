import { db } from "../database/index.js";

const productColumns = `
  id,
  name,
  price,
  material,
  rating,
  review_count,
  availability
`;

export async function findAllProducts() {
  const [productResult, imageResult] = await Promise.all([
    db.query(`SELECT ${productColumns} FROM products ORDER BY id`),
    db.query(`
      SELECT product_id, image_id, label, src
      FROM product_images
      ORDER BY product_id, sort_order, image_id
    `),
  ]);
  const imagesByProductId = groupImagesByProductId(imageResult.rows);

  return productResult.rows.map((product) =>
    mapProduct(product, imagesByProductId.get(product.id) ?? []),
  );
}

export async function findProductById(productId, queryable = db) {
  const productResult = await queryable.query(
    `SELECT ${productColumns} FROM products WHERE id = $1`,
    [productId],
  );
  const product = productResult.rows[0];

  if (!product) {
    return null;
  }

  const imageResult = await queryable.query(
    `
      SELECT product_id, image_id, label, src
      FROM product_images
      WHERE product_id = $1
      ORDER BY sort_order, image_id
    `,
    [productId],
  );

  return mapProduct(product, imageResult.rows);
}

export async function insertProduct(product) {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await client.query(
      `
        INSERT INTO products (
          name,
          price,
          material,
          rating,
          review_count,
          availability,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id
      `,
      [
        product.name,
        product.price,
        product.material,
        product.rating,
        product.reviewCount,
        product.availability,
      ],
    );
    const productId = result.rows[0].id;

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
        `,
        [productId, image.id, image.label, image.src, index],
      );
    }

    const createdProduct = await findProductById(productId, client);
    await client.query("COMMIT");
    return createdProduct;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

function groupImagesByProductId(imageRows) {
  const imagesByProductId = new Map();

  for (const image of imageRows) {
    const productImages = imagesByProductId.get(image.product_id) ?? [];
    productImages.push(image);
    imagesByProductId.set(image.product_id, productImages);
  }

  return imagesByProductId;
}

function mapProduct(product, images) {
  return {
    id: product.id,
    name: product.name,
    price: toSafeInteger(product.price, "Product price"),
    material: product.material,
    rating: product.rating,
    reviewCount: product.review_count,
    availability: product.availability,
    imageGallery: images.map((image) => ({
      id: image.image_id,
      label: image.label,
      src: image.src,
    })),
  };
}

function toSafeInteger(value, label) {
  const number = Number(value);

  if (!Number.isSafeInteger(number)) {
    throw new Error(`${label} is outside the safe integer range.`);
  }

  return number;
}
