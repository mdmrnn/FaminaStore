const API_BASE_URL = "http://localhost:5000";
const ORDERS_ENDPOINT = `${API_BASE_URL}/api/orders`;

export type ShippingMethod = "post" | "courier";
export type PaymentMethod = "online";

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
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  createdAt: string;
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
    typeof order.status === "string" &&
    typeof order.createdAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
