const FREE_SHIPPING_THRESHOLD = 10_000_000;
const SHIPPING_COSTS = {
  post: 100_000,
  courier: 400_000,
};

export function calculateShippingCost(subtotal, shippingMethod) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }

  return SHIPPING_COSTS[shippingMethod];
}
