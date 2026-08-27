import { insertOrder } from "../repositories/orderRepository.js";
import { findProductById } from "../repositories/productRepository.js";
import { calculateShippingCost } from "./shippingService.js";

export function placeOrder({
  customer,
  items,
  shippingMethod,
  paymentMethod,
}) {
  const orderItems = items.map(({ productId, quantity }) => {
    const product = findProductById(productId);

    if (!product) {
      throw new Error(`Product ${productId} was not found.`);
    }

    return {
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
    };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0,
  );
  const shippingCost = calculateShippingCost(subtotal, shippingMethod);

  const order = {
    id: `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    customer: normalizeCustomer(customer),
    items: orderItems,
    shippingMethod,
    paymentMethod,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
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
