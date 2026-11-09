import ZarinPal from "zarinpal-node-sdk";
import { zarinpalConfig } from "../config/payment.js";
import {
  completeZarinpalPayment,
  findLatestPendingZarinpalAttempt,
  findZarinpalAttemptByAuthority,
  findZarinpalAttemptById,
  getOrderPaymentStatus,
  markZarinpalAttemptCancelled,
  markZarinpalAttemptFailed,
  prepareZarinpalPaymentAttempt,
  saveZarinpalAuthority,
} from "../repositories/paymentRepository.js";

const minimumAmountRial = 1_000;
const providerRequestTimeoutMs = 15_000;

export class PaymentFlowError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "PaymentFlowError";
    this.statusCode = statusCode;
  }
}

export function getPaymentMethods() {
  return {
    manual: true,
    zarinpal: zarinpalConfig.enabled,
  };
}

export async function startZarinpalPayment(orderId) {
  if (!zarinpalConfig.enabled) {
    throw new PaymentFlowError("پرداخت آنلاین در حال حاضر فعال نیست.", 503);
  }

  const attempt = await prepareZarinpalPaymentAttempt(orderId);

  if (attempt.kind === "missing") {
    throw new PaymentFlowError("سفارش پیدا نشد.", 404);
  }
  if (attempt.kind === "already_paid") {
    throw new PaymentFlowError("این سفارش قبلاً پرداخت شده است.", 409);
  }
  if (attempt.kind === "cancelled") {
    throw new PaymentFlowError("سفارش لغو شده و قابل پرداخت نیست.", 409);
  }
  if (attempt.kind === "wrong_method") {
    throw new PaymentFlowError("این سفارش برای پرداخت زرین‌پال ثبت نشده است.", 409);
  }
  if (attempt.kind === "amount_too_small") {
    throw new PaymentFlowError(
      "مبلغ سفارش از حداقل مبلغ پرداخت آنلاین کمتر است.",
      400,
    );
  }
  if (attempt.kind === "amount_out_of_range") {
    throw new PaymentFlowError(
      "مبلغ سفارش در محدودهٔ قابل‌پرداخت زرین‌پال نیست.",
      400,
    );
  }
  if (attempt.kind === "initializing") {
    throw new PaymentFlowError(
      "درخواست پرداخت سفارش در حال آماده‌سازی است؛ کمی بعد دوباره تلاش کنید.",
      409,
    );
  }

  const client = createZarinpalClient();

  if (attempt.kind === "existing") {
    return {
      attemptId: String(attempt.attemptId),
      redirectUrl: client.payments.getRedirectUrl(attempt.authority),
    };
  }

  const amount = toRial(attempt.amountToman);
  const callbackUrl = new URL(
    "/api/payments/zarinpal/callback",
    zarinpalConfig.backendPublicUrl,
  ).toString();

  try {
    const response = await client.payments.create({
      amount,
      currency: "IRR",
      callback_url: callbackUrl,
      description: `پرداخت سفارش ${orderId}`,
      mobile: attempt.customerMobile,
    });
    const code = Number(response?.data?.code);
    const authority = response?.data?.authority;

    if (code !== 100 || !isAuthority(authority)) {
      await markZarinpalAttemptFailed(attempt.attemptId);
      throw new PaymentFlowError(
        "زرین‌پال درخواست پرداخت را نپذیرفت. کمی بعد دوباره تلاش کنید.",
        502,
      );
    }

    const authoritySaved = await saveZarinpalAuthority(
      attempt.attemptId,
      authority,
    );
    if (!authoritySaved) {
      throw new Error("Payment authority could not be saved.");
    }

    return {
      attemptId: String(attempt.attemptId),
      redirectUrl: client.payments.getRedirectUrl(authority),
    };
  } catch (error) {
    await markZarinpalAttemptFailed(attempt.attemptId).catch(() => {});

    if (error instanceof PaymentFlowError) {
      throw error;
    }

    console.error("Zarinpal payment request failed:", error.message);
    throw new PaymentFlowError(
      "ارتباط با زرین‌پال برقرار نشد. سفارش ثبت است؛ دوباره تلاش کنید.",
      502,
    );
  }
}

export async function getOrderPaymentSummary(orderId) {
  const payment = await getOrderPaymentStatus(orderId);

  if (!payment) {
    return null;
  }

  return {
    ...payment,
    canRetry:
      zarinpalConfig.enabled &&
      payment.paymentMethod === "zarinpal" &&
      payment.paymentStatus !== "paid" &&
      payment.orderStatus !== "cancelled" &&
      payment.attemptStatus !== "pending",
  };
}

export async function verifyOrderPayment(orderId) {
  const payment = await getOrderPaymentStatus(orderId);

  if (!payment) {
    throw new PaymentFlowError("سفارش پیدا نشد.", 404);
  }
  if (payment.paymentStatus === "paid") {
    return { outcome: "paid" };
  }
  if (payment.paymentMethod !== "zarinpal") {
    throw new PaymentFlowError("این سفارش پرداخت زرین‌پال ندارد.", 409);
  }

  const attempt = await findLatestPendingZarinpalAttempt(orderId);
  if (!attempt) {
    return { outcome: payment.attemptStatus ?? "pending" };
  }

  return verifyZarinpalAttempt(attempt.id);
}

export async function handleZarinpalCallback(authority, status) {
  if (!isAuthority(authority)) {
    return { outcome: "unknown", orderId: null };
  }

  const attempt = await findZarinpalAttemptByAuthority(authority);
  if (!attempt) {
    return { outcome: "unknown", orderId: null };
  }

  if (attempt.status === "paid" && attempt.paymentStatus === "paid") {
    return { outcome: "paid", orderId: attempt.orderId };
  }

  try {
    const result = await verifyZarinpalAttempt(attempt.id);

    if (status === "NOK" && result.outcome === "failed") {
      await markZarinpalAttemptCancelled(attempt.id);
      return { outcome: "cancelled", orderId: attempt.orderId };
    }

    return { ...result, orderId: attempt.orderId };
  } catch (error) {
    console.error("Zarinpal callback verification failed:", error.message);
    return { outcome: "pending", orderId: attempt.orderId };
  }
}

async function verifyZarinpalAttempt(attemptId) {
  const attempt = await findZarinpalAttemptById(attemptId);

  if (!attempt) {
    throw new PaymentFlowError("تلاش پرداخت پیدا نشد.", 404);
  }
  if (attempt.status === "paid" && attempt.paymentStatus === "paid") {
    return { outcome: "paid" };
  }
  if (!attempt.authority) {
    return { outcome: "pending" };
  }

  let response;
  try {
    response = await createZarinpalClient().verifications.verify({
      amount: toRial(attempt.amountToman),
      authority: attempt.authority,
    });
  } catch (error) {
    throw new PaymentFlowError(
      "زرین‌پال فعلاً پاسخ تأیید نداد؛ وضعیت پرداخت را دوباره بررسی کنید.",
      502,
    );
  }

  const code = Number(response?.data?.code);
  if (code === 100 || code === 101) {
    const referenceId = normalizeReferenceId(response?.data?.ref_id);
    const completed = await completeZarinpalPayment(attempt.id, referenceId);

    if (!completed) {
      throw new PaymentFlowError("سفارش پرداخت‌شده پیدا نشد.", 404);
    }

    return { outcome: "paid", referenceId };
  }

  await markZarinpalAttemptFailed(attempt.id);
  return { outcome: "failed", code: Number.isFinite(code) ? code : null };
}

function createZarinpalClient() {
  if (!zarinpalConfig.merchantId || isPlaceholder(zarinpalConfig.merchantId)) {
    throw new PaymentFlowError(
      "شناسهٔ پذیرندهٔ زرین‌پال در تنظیمات بک‌اند کامل نشده است.",
      503,
    );
  }

  const client = new ZarinPal({
    merchantId: zarinpalConfig.merchantId,
    sandbox: zarinpalConfig.sandbox,
  });

  // The SDK does not expose a timeout option, but its Axios client supports one.
  client.httpClient.defaults.timeout = providerRequestTimeoutMs;
  return client;
}

function toRial(amountToman) {
  const amountRial = amountToman * 10;

  if (!Number.isSafeInteger(amountRial) || amountRial < minimumAmountRial) {
    throw new PaymentFlowError(
      "مبلغ سفارش باید حداقل ۱۰۰ تومان و در محدودهٔ مجاز باشد.",
      400,
    );
  }

  return amountRial;
}

function isAuthority(value) {
  return typeof value === "string" && /^[AS][0-9a-zA-Z]{35}$/.test(value);
}

function normalizeReferenceId(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isSafeInteger(value)) {
    return String(value);
  }

  return null;
}

function isPlaceholder(value) {
  return /(?:replace|placeholder|example\.com|your[-_ ]|<[^>]*>)/i.test(value);
}

