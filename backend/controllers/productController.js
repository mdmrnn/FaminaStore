import {
  insertProduct,
  findAllProducts,
} from "../repositories/productRepository.js";
import {
  ProductImageValidationError,
  removeProductImages,
  saveProductImages,
} from "../services/productImageService.js";
import { validateProduct } from "../validators/productValidator.js";

export async function getProducts(req, res) {
  const products = await findAllProducts();
  return res.status(200).json(products);
}

export async function createProduct(req, res) {
  const validation = validateProduct(req.body ?? {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const product = validation.data;
  let savedImages;

  try {
    savedImages = await saveProductImages(product.imageGallery);
  } catch (error) {
    if (error instanceof ProductImageValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Product image upload failed:", error.message);
    return res.status(500).json({ error: "ذخیره تصاویر محصول انجام نشد." });
  }

  try {
    const createdProduct = await insertProduct({
      name: product.name,
      price: product.price,
      material: product.material,
      rating: product.rating,
      reviewCount: product.reviewCount,
      availability: product.availability,
      imageGallery: savedImages.imageGallery,
    });

    return res.status(201).json(createdProduct);
  } catch (error) {
    await removeProductImages(savedImages.filePaths);
    console.error("Product database insert failed:", error.message);
    return res
      .status(500)
      .json({ error: "ثبت محصول در پایگاه داده انجام نشد." });
  }
}
