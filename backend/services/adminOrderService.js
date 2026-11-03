import {
  compareAndSetOrderStatus,
  findOrderState,
  markOrderPaid,
} from "../repositories/orderRepository.js";

export const orderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function transitionOrderStatus(orderId, nextStatus) {
  const currentOrder = await findOrderState(orderId);

  if (!currentOrder) {
    return { success: false, reason: "not_found" };
  }

  if (currentOrder.status === nextStatus) {
    return { success: true, status: nextStatus };
  }

  if (!validTransitions[currentOrder.status]?.includes(nextStatus)) {
    return {
      success: false,
      reason: "invalid_transition",
      currentStatus: currentOrder.status,
    };
  }

  const changed = await compareAndSetOrderStatus(
    orderId,
    currentOrder.status,
    nextStatus,
  );

  if (!changed) {
    return { success: false, reason: "conflict" };
  }

  return { success: true, status: nextStatus };
}

export async function markOrderPaymentReceived(orderId) {
  const currentOrder = await findOrderState(orderId);

  if (!currentOrder) {
    return { success: false, reason: "not_found" };
  }

  if (currentOrder.paymentStatus === "paid") {
    return { success: true, paymentStatus: "paid" };
  }

  if (currentOrder.status === "cancelled") {
    return { success: false, reason: "invalid_transition" };
  }

  const changed = await markOrderPaid(orderId);

  if (!changed) {
    return { success: false, reason: "conflict" };
  }

  return { success: true, paymentStatus: "paid" };
}
