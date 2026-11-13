import {
  createOrderRequestHash,
  findIdempotentOrder,
  placeOrder,
} from "../services/orderService.js";
import {
  getOrderPaymentSummary,
  PaymentFlowError,
  startZarinpalPayment,
  verifyOrderPayment,
} from "../services/zarinpalPaymentService.js";
import { validateOrderRequest } from "../validators/orderValidator.js";

export async function createOrder(req, res) {
  const idempotencyKey = req.get("Idempotency-Key")?.trim() ?? "";

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      message: "کلید یکتای ثبت سفارش معتبر نیست. دوباره تلاش کنید.",
    });
  }

  try {
    const requestHash = createOrderRequestHash(req.body ?? {});
    const existing = await findIdempotentOrder(idempotencyKey, requestHash);

    if (existing?.conflict) {
      return res.status(409).json({
        success: false,
        message: "این درخواست قبلاً با اطلاعات دیگری استفاده شده است.",
      });
    }

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "سفارش قبلی بازیابی شد.",
        order: existing.order,
      });
    }

    const validation = await validateOrderRequest(req.body ?? {});

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const result = await placeOrder(validation.data, {
      idempotencyKey,
      requestHash,
    });

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: "این درخواست قبلاً با اطلاعات دیگری استفاده شده است.",
      });
    }

    return res.status(result.created ? 201 : 200).json({
      success: true,
      message: result.created
        ? "سفارش با موفقیت ثبت شد."
        : "سفارش قبلی بازیابی شد.",
      order: result.order,
    });
  } catch (error) {
    console.error("Order creation failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "ثبت سفارش با خطای داخلی مواجه شد.",
    });
  }
}

export async function createZarinpalPayment(req, res) {
  try {
    const payment = await startZarinpalPayment(req.params.orderId);

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    return handlePaymentError(res, error, "Payment start failed:");
  }
}

export async function getOrderPayment(req, res) {
  try {
    const payment = await getOrderPaymentSummary(req.params.orderId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "سفارش پیدا نشد.",
      });
    }

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return handlePaymentError(res, error, "Payment status lookup failed:");
  }
}

export async function verifyOrderPaymentController(req, res) {
  try {
    const payment = await verifyOrderPayment(req.params.orderId);

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return handlePaymentError(res, error, "Payment verification retry failed:");
  }
}

function handlePaymentError(res, error, logPrefix) {
  const statusCode =
    error instanceof PaymentFlowError ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(logPrefix, error.message);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode < 500
        ? error.message
        : "پرداخت در حال حاضر قابل انجام یا بررسی نیست. کمی بعد دوباره تلاش کنید.",
  });
}
