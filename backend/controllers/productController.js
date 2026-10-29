import {
  createProduct as insertProduct,
  findAllProducts,
} from "../repositories/productRepository.js";
import {
  ProductImageValidationError,
  removeProductImages,
  saveProductImages,
} from "../services/productImageService.js";

const allowedMaterials = new Set(["ابریشم", "نخی", "وال اسلپ", "ژاکارد"]);

export function getProducts(req, res) {
  return res.status(200).json(findAllProducts());
}

export async function createProduct(req, res) {
  const product = req.body;

  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return res.status(400).json({ error: "اطلاعات محصول معتبر نیست." });
  }

  const name = typeof product.name === "string" ? product.name.trim() : "";
  if (!name || name.length > 120) {
    return res.status(400).json({ error: "نام محصول الزامی و حداکثر ۱۲۰ نویسه است." });
  }

  if (!Number.isSafeInteger(product.price) || product.price < 0) {
    return res.status(400).json({ error: "قیمت باید عدد صحیح و صفر یا بیشتر باشد." });
  }

  if (typeof product.material !== "string" || !allowedMaterials.has(product.material)) {
    return res.status(400).json({ error: "جنس انتخاب‌شده معتبر نیست." });
  }

  if (typeof product.rating !== "number" || product.rating < 0 || product.rating > 5) {
    return res.status(400).json({ error: "امتیاز باید بین صفر تا پنج باشد." });
  }

  if (!Number.isSafeInteger(product.reviewCount) || product.reviewCount < 0) {
    return res.status(400).json({ error: "تعداد نظرها باید عدد صحیح و صفر یا بیشتر باشد." });
  }

  if (typeof product.availability !== "boolean") {
    return res.status(400).json({ error: "وضعیت موجودی معتبر نیست." });
  }

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
      name,
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
    return res.status(500).json({ error: "ثبت محصول در پایگاه داده انجام نشد." });
  }
}
