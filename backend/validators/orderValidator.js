import { findProductById } from "../repositories/productRepository.js";

const validShippingMethods = ["post", "courier"];
const validPaymentMethods = ["online"];

export function validateOrderRequest(payload) {
  const {
    customer,
    items,
    shippingMethod = "post",
    paymentMethod = "online",
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

  const itemErrors = validateItems(items);
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
      errors: ["paymentMethod فعلاً باید online باشد."],
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

  if (!customer || typeof customer !== "object") {
    return ["customer الزامی است."];
  }

  if (
    typeof customer.fullName !== "string" ||
    customer.fullName.trim().length < 2
  ) {
    errors.push("نام و نام خانوادگی الزامی است.");
  }

  if (
    typeof customer.mobile !== "string" ||
    !/^09\d{9}$/.test(customer.mobile.replace(/\s/g, ""))
  ) {
    errors.push("شماره موبایل معتبر نیست.");
  }

  for (const field of ["province", "city"]) {
    if (
      typeof customer[field] !== "string" ||
      customer[field].trim().length === 0
    ) {
      errors.push(`${field} الزامی است.`);
    }
  }

  if (
    typeof customer.address !== "string" ||
    customer.address.trim().length < 10
  ) {
    errors.push("آدرس باید حداقل ۱۰ کاراکتر باشد.");
  }

  if (
    customer.deliveryNote !== undefined &&
    typeof customer.deliveryNote !== "string"
  ) {
    errors.push("deliveryNote باید متن باشد.");
  }

  return errors;
}

function validateItems(items) {
  const errors = [];

  for (const [index, item] of items.entries()) {
    const productId = item?.productId;
    const quantity = item?.quantity;
    const product = findProductById(productId);

    if (!Number.isInteger(productId) || !product) {
      errors.push(`items[${index}].productId معتبر نیست.`);
      continue;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      errors.push(
        `items[${index}].quantity باید عدد صحیح بزرگ‌تر از صفر باشد.`,
      );
      continue;
    }

    if (!product.availability) {
      errors.push(`محصول ${productId} در حال حاضر موجود نیست.`);
    }
  }

  return errors;
}
