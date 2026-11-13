import { createHash, randomUUID } from "node:crypto";
import {
  findOrderByIdempotencyKey,
  insertOrder,
} from "../repositories/orderRepository.js";
import { findProductById } from "../repositories/productRepository.js";
import { normalizeMobileDigits } from "../utils/normalizeMobileDigits.js";
import { calculateShippingCost } from "./shippingService.js";

export async function placeOrder({
  customer,
  items,
  shippingMethod,
  paymentMethod,
}, idempotency) {
  const orderItems = [];

  for (const { productId, quantity } of items) {
    const product = await findProductById(productId);

    if (!product || !product.availability) {
      throw new Error(`Product ${productId} is unavailable.`);
    }

    const totalPrice = product.price * quantity;
    if (!Number.isSafeInteger(totalPrice)) {
      throw new Error(`Product ${productId} total is outside the safe range.`);
    }

    orderItems.push({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice,
    });
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );

  if (!Number.isSafeInteger(subtotal)) {
    throw new Error("Order subtotal is outside the safe range.");
  }

  const shippingCost = calculateShippingCost(subtotal, shippingMethod);
  const total = subtotal + shippingCost;
  if (!Number.isSafeInteger(total)) {
    throw new Error("Order total is outside the safe range.");
  }

  const order = {
    id: `ORD-${randomUUID()}`,
    customer: normalizeCustomer(customer),
    items: orderItems,
    shippingMethod,
    paymentMethod,
    paymentStatus: "unpaid",
    subtotal,
    shippingCost,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return insertOrder(order, idempotency);
}

export function createOrderRequestHash(payload) {
  return createHash("sha256").update(stableStringify(payload)).digest("hex");
}

export async function findIdempotentOrder(idempotencyKey, requestHash) {
  const existing = await findOrderByIdempotencyKey(idempotencyKey);

  if (!existing) {
    return null;
  }

  return {
    conflict: existing.requestHash !== requestHash,
    order: existing.order,
  };
}

function normalizeCustomer(customer) {
  return {
    fullName: customer.fullName.trim(),
    mobile: normalizeMobileDigits(customer.mobile),
    province: customer.province.trim(),
    city: customer.city.trim(),
    address: customer.address.trim(),
    ...(customer.deliveryNote?.trim()
      ? { deliveryNote: customer.deliveryNote.trim() }
      : {}),
  };
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);

    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}
