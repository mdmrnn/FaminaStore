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

  const order = placeOrder(validation.data);

  return res.status(201).json({
    success: true,
    message: "سفارش با موفقیت ثبت شد.",
    order,
  });
}
