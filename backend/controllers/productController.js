import {
  createProduct as insertProduct,
  findAllProducts,
} from "../repositories/productRepository.js";
import {
  ProductImageValidationError,
  removeProductImages,
  saveProductImages,
} from "../services/productImageService.js";
import { validateProduct } from "../validators/productValidator.js";

export function getProducts(req, res) {
  return res.status(200).json(findAllProducts());
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
    return res.status(500).json({ error: "ذخیرهٔ تصاویر محصول انجام نشد." });
  }

  try {
    const createdProduct = insertProduct({
      name: product.name,
      price: product.price,
      material: product.material,
      rating: product.rating,
      reviewCount: product.reviewCount,
      availability: product.availability,
      imageGallery: savedImages.imageGallery,
    });

    return res.status(201).json(createdProduct);
  } catch {
    await removeProductImages(savedImages.filePaths);
    return res
      .status(500)
      .json({ error: "ثبت محصول در پایگاه داده انجام نشد." });
  }
}
