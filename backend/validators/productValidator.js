export function validateProduct(product) {
  const allowedMaterials = new Set(["ابریشم", "نخی", "وال اسلپ", "ژاکارد"]);

  if (!product || typeof product !== "object" || Array.isArray(product)) {
    return {
      valid: false,
      error: "اطلاعات محصول معتبر نیست.",
    };
  }

  const name = typeof product.name === "string" ? product.name.trim() : "";
  product.name = name;
  if (!name || name.length > 120) {
    return {
      valid: false,
      error: "نام محصول الزامی و حداکثر ۱۲۰ نویسه است.",
    };
  }

  if (!Number.isSafeInteger(product.price) || product.price < 0) {
    return {
      valid: false,
      error: "قیمت باید عدد صحیح و صفر یا بیشتر باشد.",
    };
  }

  if (
    typeof product.material !== "string" ||
    !allowedMaterials.has(product.material)
  ) {
    return {
      valid: false,
      error: "جنس انتخاب‌شده معتبر نیست.",
    };
  }

  if (
    typeof product.rating !== "number" ||
    product.rating < 0 ||
    product.rating > 5
  ) {
    return {
      valid: false,
      error: "امتیاز باید بین صفر تا پنج باشد.",
    };
  }

  if (!Number.isSafeInteger(product.reviewCount) || product.reviewCount < 0) {
    return {
      valid: false,
      error: "تعداد نظرها باید عدد صحیح و صفر یا بیشتر باشد.",
    };
  }

  if (typeof product.availability !== "boolean") {
    return {
      valid: false,
      error: "وضعیت موجودی معتبر نیست.",
    };
  }

  return {
    valid: true,
    data: product,
  };
}
