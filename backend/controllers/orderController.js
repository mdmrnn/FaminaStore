import { placeOrder } from "../services/orderService.js";
import { validateOrderRequest } from "../validators/orderValidator.js";

export function createOrder(req, res) {
  const validation = validateOrderRequest(req.body ?? {});

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.message,
      errors: validation.errors,
    });
  }

  let order;

  try {
    order = placeOrder(validation.data);
  } catch {
    return res.status(500).json({
      success: false,
      message: "ثبت سفارش با خطای داخلی مواجه شد.",
    });
  }

  return res.status(201).json({
    success: true,
    message: "سفارش با موفقیت ثبت شد.",
    order,
  });
}
