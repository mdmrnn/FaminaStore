import { zarinpalConfig } from "../config/payment.js";
import {
  getPaymentMethods,
  handleZarinpalCallback,
} from "../services/zarinpalPaymentService.js";

export function getAvailablePaymentMethods(req, res) {
  return res.status(200).json({
    success: true,
    methods: getPaymentMethods(),
  });
}

export async function zarinpalCallback(req, res) {
  const authority = typeof req.query.Authority === "string"
    ? req.query.Authority
    : "";
  const status = typeof req.query.Status === "string" ? req.query.Status : "";

  try {
    const result = await handleZarinpalCallback(authority, status);
    return redirectToOrderResult(res, result.orderId, result.outcome);
  } catch (error) {
    console.error("Zarinpal callback failed:", error.message);
    return redirectToOrderResult(res, null, "pending");
  }
}

function redirectToOrderResult(res, orderId, outcome) {
  if (!zarinpalConfig.frontendUrl) {
    return res
      .status(200)
      .type("text/plain")
      .send("درخواست پرداخت پردازش شد. به فروشگاه بازگردید و وضعیت سفارش را بررسی کنید.");
  }

  const returnUrl = new URL("/order-success", zarinpalConfig.frontendUrl);
  if (orderId) {
    returnUrl.searchParams.set("orderId", orderId);
  }
  returnUrl.searchParams.set("payment", outcome);

  return res.redirect(303, returnUrl.toString());
}
