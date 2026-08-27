import { createOrder } from "../data/orders.js";
import { products } from "../data/products.js";
import { calculateShippingCost } from "./shippingService.js";

export function placeOrder({
  customer,
  items,
  shippingMethod,
  paymentMethod,
}) {
  const orderItems = items.map(({ productId, quantity }) => {
    const product = products.find((candidate) => candidate.id === productId);

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

  return createOrder(order);
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
