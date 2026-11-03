import { placeOrder } from "../services/orderService.js";
import { validateOrderRequest } from "../validators/orderValidator.js";

export async function createOrder(req, res) {
  try {
    const validation = await validateOrderRequest(req.body ?? {});

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const order = await placeOrder(validation.data);

    return res.status(201).json({
      success: true,
      message: "سفارش با موفقیت ثبت شد.",
      order,
    });
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "ثبت سفارش با خطای داخلی مواجه شد.",
    });
  }
}
