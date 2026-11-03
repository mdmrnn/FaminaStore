import { randomUUID } from "node:crypto";
import { insertOrder } from "../repositories/orderRepository.js";
import { findProductById } from "../repositories/productRepository.js";
import { calculateShippingCost } from "./shippingService.js";

export async function placeOrder({
  customer,
  items,
  shippingMethod,
  paymentMethod,
}) {
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

  return insertOrder(order);
}

function normalizeCustomer(customer) {
  return {
    fullName: customer.fullName.trim(),
    mobile: customer.mobile.replace(/\s/g, ""),
    province: customer.province.trim(),
    city: customer.city.trim(),
    address: customer.address.trim(),
    ...(customer.deliveryNote?.trim()
      ? { deliveryNote: customer.deliveryNote.trim() }
      : {}),
  };
}
