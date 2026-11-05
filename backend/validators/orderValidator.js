import { findProductById } from "../repositories/productRepository.js";
import { normalizeMobileDigits } from "../utils/normalizeMobileDigits.js";

const validShippingMethods = ["post", "courier"];
const validPaymentMethods = ["manual"];
const maxOrderItems = 50;
const maxQuantityPerItem = 100;

export async function validateOrderRequest(payload) {
  const {
    customer,
    items,
    shippingMethod = "post",
    paymentMethod = "manual",
  } = payload;

  const customerErrors = validateCustomer(customer);
  if (customerErrors.length > 0) {
    return {
      valid: false,
      message: "اطلاعات مشتری معتبر نیست.",
      errors: customerErrors,
    };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: "سبد سفارش نمی‌تواند خالی باشد.",
      errors: ["items باید آرایه‌ای غیرخالی باشد."],
    };
  }

  if (items.length > maxOrderItems) {
    return {
      valid: false,
      message: `هر سفارش حداکثر می‌تواند ${maxOrderItems} محصول داشته باشد.`,
      errors: ["تعداد محصولات سفارش بیش از حد مجاز است."],
    };
  }

  const itemErrors = await validateItems(items);
  if (itemErrors.length > 0) {
    return {
      valid: false,
      message: "اطلاعات محصولات معتبر نیست.",
      errors: itemErrors,
    };
  }

  if (!validShippingMethods.includes(shippingMethod)) {
    return {
      valid: false,
      message: "روش ارسال معتبر نیست.",
      errors: ["shippingMethod باید post یا courier باشد."],
    };
  }

  if (!validPaymentMethods.includes(paymentMethod)) {
    return {
      valid: false,
      message: "روش پرداخت معتبر نیست.",
      errors: ["روش پرداخت فعلاً باید manual باشد."],
    };
  }

  return {
    valid: true,
    data: {
      customer,
      items,
      shippingMethod,
      paymentMethod,
    },
  };
}

function validateCustomer(customer) {
  const errors = [];

  if (!customer || typeof customer !== "object" || Array.isArray(customer)) {
    return ["customer الزامی است."];
  }

  if (
    typeof customer.fullName !== "string" ||
    customer.fullName.trim().length < 2 ||
    customer.fullName.trim().length > 120
  ) {
    errors.push("نام و نام خانوادگی باید بین ۲ تا ۱۲۰ نویسه باشد.");
  }

  if (
    typeof customer.mobile !== "string" ||
    !/^09\d{9}$/.test(normalizeMobileDigits(customer.mobile))
  ) {
    errors.push("شماره موبایل معتبر نیست.");
  }

  for (const field of ["province", "city"]) {
    if (
      typeof customer[field] !== "string" ||
      customer[field].trim().length === 0 ||
      customer[field].trim().length > 100
    ) {
      errors.push(`${field} الزامی است و باید حداکثر ۱۰۰ نویسه باشد.`);
    }
  }

  if (
    typeof customer.address !== "string" ||
    customer.address.trim().length < 10 ||
    customer.address.trim().length > 500
  ) {
    errors.push("آدرس باید بین ۱۰ تا ۵۰۰ نویسه باشد.");
  }

  if (
    customer.deliveryNote !== undefined &&
    (typeof customer.deliveryNote !== "string" ||
      customer.deliveryNote.trim().length > 500)
  ) {
    errors.push("یادداشت ارسال باید حداکثر ۵۰۰ نویسه باشد.");
  }

  return errors;
}

async function validateItems(items) {
  const errors = [];

  for (const [index, item] of items.entries()) {
    const productId = item?.productId;
    const quantity = item?.quantity;

    if (!Number.isSafeInteger(productId) || productId < 1) {
      errors.push(`items[${index}].productId معتبر نیست.`);
      continue;
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > maxQuantityPerItem
    ) {
      errors.push(
        `تعداد هر محصول باید عدد صحیحی بین ۱ تا ${maxQuantityPerItem} باشد.`,
      );
      continue;
    }

    const product = await findProductById(productId);
    if (!product) {
      errors.push(`محصول ${productId} معتبر نیست.`);
      continue;
    }

    if (!product.availability) {
      errors.push(`محصول ${productId} در حال حاضر موجود نیست.`);
    }
  }

  return errors;
}
