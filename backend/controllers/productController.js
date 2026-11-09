import {
  deleteProduct as deleteProductFromDatabase,
  insertProduct,
  findAllProducts,
  updateProduct as updateProductInDatabase,
} from "../repositories/productRepository.js";
import {
  ProductImageValidationError,
  removeProductImages,
  removeUploadedProductImages,
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

export async function updateProductById(req, res) {
  const productId = Number(req.params.id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({
      success: false,
      error: "شناسه محصول معتبر نیست.",
    });
  }

  const validation = validateProduct(req.body ?? {});
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: validation.error,
    });
  }

  const product = validation.data;
  let savedImages;

  if (Object.hasOwn(product, "imageGallery")) {
    try {
      savedImages = await saveProductImages(product.imageGallery);
    } catch (error) {
      if (error instanceof ProductImageValidationError) {
        return res.status(400).json({ error: error.message });
      }

      console.error("Product image upload failed:", error.message);
      return res.status(500).json({ error: "ذخیره تصاویر محصول انجام نشد." });
    }
  }

  const productToUpdate = { ...product };
  if (savedImages) {
    productToUpdate.imageGallery = savedImages.imageGallery;
  }

  let updateResult;
  try {
    updateResult = await updateProductInDatabase(productId, productToUpdate);
  } catch (error) {
    if (savedImages) {
      await removeProductImages(savedImages.filePaths);
    }

    console.error("Product database update failed:", error.message);
    return res.status(500).json({ error: "ویرایش محصول انجام نشد." });
  }

  if (!updateResult) {
    if (savedImages) {
      await removeProductImages(savedImages.filePaths);
    }

    return res.status(404).json({
      success: false,
      error: "محصولی با این شناسه پیدا نشد.",
    });
  }

  if (updateResult.replacedImageGallery.length > 0) {
    await removeUploadedProductImages(updateResult.replacedImageGallery);
  }

  return res.status(200).json(updateResult.product);
}

export async function deleteProductById(req, res) {
  const productId = Number(req.params.id);
  if (!Number.isSafeInteger(productId) || productId < 1) {
    return res.status(400).json({
      success: false,
      error: "شناسه محصول معتبر نیست.",
    });
  }

  let deletedProduct;
  try {
    deletedProduct = await deleteProductFromDatabase(productId);
  } catch (error) {
    console.error("Product database delete failed:", error.message);
    return res.status(500).json({ error: "حذف محصول انجام نشد." });
  }

  if (!deletedProduct) {
    return res.status(404).json({
      success: false,
      error: "محصولی با این شناسه پیدا نشد.",
    });
  }

  await removeUploadedProductImages(deletedProduct.imageGallery);

  return res.status(200).json({
    success: true,
    productId: deletedProduct.id,
  });
}
