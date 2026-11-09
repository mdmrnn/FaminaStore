import { apiUrl } from "./apiBase";

const ORDERS_ENDPOINT = apiUrl("/api/orders");
const PAYMENTS_ENDPOINT = apiUrl("/api/payments");

export type ShippingMethod = "post" | "courier";
export type PaymentMethod = "manual" | "zarinpal";
export type PaymentAttemptStatus = "pending" | "paid" | "failed" | "cancelled";

export interface CreateOrderRequest {
  customer: {
    fullName: string;
    mobile: string;
    province: string;
    city: string;
    address: string;
    deliveryNote?: string;
  };
  items: {
    productId: number;
    quantity: number;
  }[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
}

export interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  customer: CreateOrderRequest["customer"];
  items: OrderItem[];
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid";
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface OrderPaymentSummary {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentStatus: "unpaid" | "paid";
  orderStatus: string;
  total: number;
  attemptStatus: PaymentAttemptStatus | null;
  referenceId: string | null;
  canVerify: boolean;
  canRetry: boolean;
}

interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

export async function createOrder(
  request: CreateOrderRequest,
): Promise<Order> {
  let response: Response;

  try {
    response = await fetch(ORDERS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error("ارتباط با سرور برقرار نشد.");
  }

  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, response.statusText));
  }

  if (!isCreateOrderResponse(responseData)) {
    throw new Error("پاسخ ثبت سفارش از سرور معتبر نیست.");
  }

  return responseData.order;
}

export async function getPaymentMethods(): Promise<{
  manual: boolean;
  zarinpal: boolean;
}> {
  const response = await fetchApi(
    PAYMENTS_ENDPOINT + "/methods",
    undefined,
    "ارتباط با سرور برقرار نشد.",
  );
  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, "روش‌های پرداخت دریافت نشد."));
  }

  if (
    !isRecord(responseData) ||
    responseData.success !== true ||
    !isRecord(responseData.methods) ||
    typeof responseData.methods.manual !== "boolean" ||
    typeof responseData.methods.zarinpal !== "boolean"
  ) {
    throw new Error("پاسخ روش‌های پرداخت از سرور معتبر نیست.");
  }

  return {
    manual: responseData.methods.manual,
    zarinpal: responseData.methods.zarinpal,
  };
}

export async function startOrderPayment(orderId: string): Promise<string> {
  const response = await fetchApi(
    `${ORDERS_ENDPOINT}/${encodeURIComponent(orderId)}/payment`,
    { method: "POST" },
    "ارتباط با سرور برقرار نشد.",
  );
  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, "شروع پرداخت انجام نشد."));
  }

  if (
    !isRecord(responseData) ||
    responseData.success !== true ||
    !isRecord(responseData.payment) ||
    typeof responseData.payment.redirectUrl !== "string"
  ) {
    throw new Error("آدرس پرداخت از سرور معتبر نیست.");
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(responseData.payment.redirectUrl);
  } catch {
    throw new Error("آدرس درگاه پرداخت معتبر نیست.");
  }

  if (
    redirectUrl.protocol !== "https:" ||
    !redirectUrl.hostname.endsWith(".zarinpal.com")
  ) {
    throw new Error("آدرس درگاه پرداخت معتبر نیست.");
  }

  return redirectUrl.toString();
}

export async function getOrderPaymentStatus(
  orderId: string,
): Promise<OrderPaymentSummary> {
  const response = await fetchApi(
    `${ORDERS_ENDPOINT}/${encodeURIComponent(orderId)}/payment-status`,
    undefined,
    "ارتباط با سرور برقرار نشد.",
  );
  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, "وضعیت سفارش دریافت نشد."));
  }

  if (
    !isRecord(responseData) ||
    responseData.success !== true ||
    !isOrderPaymentSummary(responseData.payment)
  ) {
    throw new Error("وضعیت پرداخت از سرور معتبر نیست.");
  }

  return responseData.payment;
}

export async function verifyOrderPayment(orderId: string): Promise<void> {
  const response = await fetchApi(
    `${ORDERS_ENDPOINT}/${encodeURIComponent(orderId)}/payment/verify`,
    { method: "POST" },
    "ارتباط با سرور برقرار نشد.",
  );
  const responseData = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(responseData, "بررسی پرداخت انجام نشد."));
  }

  if (!isRecord(responseData) || responseData.success !== true) {
    throw new Error("پاسخ بررسی پرداخت از سرور معتبر نیست.");
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText) as unknown;
  } catch {
    return null;
  }
}

async function fetchApi(
  url: string,
  init: RequestInit | undefined,
  networkErrorMessage: string,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(networkErrorMessage);
  }
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (!isRecord(data)) {
    return fallback || "ثبت سفارش با خطا مواجه شد.";
  }

  const message = typeof data.message === "string" ? data.message : "";
  const errors = Array.isArray(data.errors)
    ? data.errors.filter((error): error is string => typeof error === "string")
    : [];
  const details = [message, ...errors].filter(Boolean);

  return details.join(" ") || fallback || "ثبت سفارش با خطا مواجه شد.";
}

function isCreateOrderResponse(
  value: unknown,
): value is CreateOrderResponse {
  if (!isRecord(value) || value.success !== true || !isRecord(value.order)) {
    return false;
  }

  const order = value.order;

  return (
    typeof value.message === "string" &&
    typeof order.id === "string" &&
    Array.isArray(order.items) &&
    typeof order.subtotal === "number" &&
    typeof order.shippingCost === "number" &&
    typeof order.total === "number" &&
    (order.paymentMethod === "manual" || order.paymentMethod === "zarinpal") &&
    (order.paymentStatus === "unpaid" || order.paymentStatus === "paid") &&
    typeof order.status === "string" &&
    typeof order.createdAt === "string"
  );
}

function isOrderPaymentSummary(value: unknown): value is OrderPaymentSummary {
  if (!isRecord(value)) {
    return false;
  }

  const validAttemptStatuses: Array<PaymentAttemptStatus | null> = [
    null,
    "pending",
    "paid",
    "failed",
    "cancelled",
  ];

  return (
    typeof value.orderId === "string" &&
    (value.paymentMethod === "manual" || value.paymentMethod === "zarinpal") &&
    (value.paymentStatus === "unpaid" || value.paymentStatus === "paid") &&
    typeof value.orderStatus === "string" &&
    typeof value.total === "number" &&
    validAttemptStatuses.includes(value.attemptStatus as PaymentAttemptStatus | null) &&
    (typeof value.referenceId === "string" || value.referenceId === null) &&
    typeof value.canVerify === "boolean" &&
    typeof value.canRetry === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
