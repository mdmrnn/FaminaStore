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

export function findAllProducts() {
  const productRows = db
    .prepare(`SELECT ${productColumns} FROM products ORDER BY id`)
    .all();
  const imageRows = db
    .prepare(`
      SELECT product_id, image_id, label, src
      FROM product_images
      ORDER BY product_id, sort_order, image_id
    `)
    .all();
  const imagesByProductId = groupImagesByProductId(imageRows);

  return productRows.map((product) =>
    mapProduct(product, imagesByProductId.get(product.id) ?? []),
  );
}

export function findProductById(productId) {
  const product = db
    .prepare(`SELECT ${productColumns} FROM products WHERE id = ?`)
    .get(productId);

  if (!product) {
    return null;
  }

  const images = db
    .prepare(`
      SELECT product_id, image_id, label, src
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order, image_id
    `)
    .all(productId);

  return mapProduct(product, images);
}

export function createProduct(product) {
  db.exec("BEGIN IMMEDIATE");

  try {
    const now = new Date().toISOString();
    const result = db
      .prepare(`
        INSERT INTO products (
          name,
          price,
          material,
          rating,
          review_count,
          availability,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        product.name,
        product.price,
        product.material,
        product.rating,
        product.reviewCount,
        product.availability ? 1 : 0,
        now,
        now,
      );
    const productId = Number(result.lastInsertRowid);
    const insertImage = db.prepare(`
      INSERT INTO product_images (
        product_id,
        image_id,
        label,
        src,
        sort_order
      ) VALUES (?, ?, ?, ?, ?)
    `);

    product.imageGallery.forEach((image, index) => {
      insertImage.run(productId, index + 1, image.label, image.src, index);
    });

    const createdProduct = findProductById(productId);
    db.exec("COMMIT");
    return createdProduct;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
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
    price: product.price,
    material: product.material,
    rating: product.rating,
    reviewCount: product.review_count,
    availability: Boolean(product.availability),
    imageGallery: images.map((image) => ({
      id: image.image_id,
      label: image.label,
      src: image.src,
    })),
  };
}
