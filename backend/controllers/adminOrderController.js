import { findRecentOrders } from "../repositories/orderRepository.js";
import {
  markOrderPaymentReceived,
  orderStatuses,
  transitionOrderStatus,
} from "../services/adminOrderService.js";

export async function getOrders(req, res) {
  try {
    const orders = await findRecentOrders();
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Admin order list failed:", error.message);
    return res.status(500).json({
      success: false,
      error: "دریافت سفارش‌ها انجام نشد.",
    });
  }
}

export async function updateOrderStatus(req, res) {
  const nextStatus = req.body?.status;
  if (!orderStatuses.includes(nextStatus)) {
    return res.status(400).json({
      success: false,
      error: "وضعیت سفارش معتبر نیست.",
    });
  }

  try {
    const result = await transitionOrderStatus(req.params.orderId, nextStatus);
    if (!result.success) {
      return respondForOrderChangeFailure(res, result.reason);
    }

    return res.status(200).json({
      success: true,
      status: result.status,
    });
  } catch (error) {
    console.error("Order status update failed:", error.message);
    return res.status(500).json({
      success: false,
      error: "به‌روزرسانی وضعیت سفارش انجام نشد.",
    });
  }
}

export async function markOrderPaid(req, res) {
  try {
    const result = await markOrderPaymentReceived(req.params.orderId);
    if (!result.success) {
      return respondForOrderChangeFailure(res, result.reason);
    }

    return res.status(200).json({
      success: true,
      paymentStatus: result.paymentStatus,
    });
  } catch (error) {
    console.error("Order payment status update failed:", error.message);
    return res.status(500).json({
      success: false,
      error: "به‌روزرسانی وضعیت پرداخت انجام نشد.",
    });
  }
}

function respondForOrderChangeFailure(res, reason) {
  if (reason === "not_found") {
    return res.status(404).json({ success: false, error: "سفارش پیدا نشد." });
  }

  if (reason === "invalid_transition") {
    return res.status(409).json({
      success: false,
      error: "این تغییر با وضعیت فعلی سفارش سازگار نیست.",
    });
  }

  return res.status(409).json({
    success: false,
    error: "سفارش هم‌زمان تغییر کرده است؛ فهرست را تازه‌سازی کن.",
  });
}
