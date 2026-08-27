export const orders = [];

export function createOrder(order) {
  orders.push(order);
  return order;
}
