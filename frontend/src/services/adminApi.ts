import type { Product } from "../types/product";
import type { Order } from "./orderApi";
import { apiUrl } from "./apiBase";

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type AdminOrder = Order & { status: AdminOrderStatus };

export interface AdminProductInput {
  name: string;
  price: number;
  material: Product["material"];
  rating: number;
  reviewCount: number;
  availability: boolean;
  imageGallery: { label: string; dataUrl: string }[];
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<string> {
  const response = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = (await response.json().catch(() => ({}))) as {
    token?: string;
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      data.error ?? data.message ?? "ارتباط با سرور انجام نشد.",
    );
  }

  if (!data.token) {
    throw new Error("توکن ورود از سرور دریافت نشد.");
  }

  return data.token;
}

export async function logoutAdmin(token: string): Promise<void> {
  const response = await fetch(apiUrl("/api/admin/logout"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 401) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
    };

    throw new Error(
      data.error ?? data.message ?? "ارتباط با سرور انجام نشد.",
    );
  }
}

export async function createAdminProduct(
  token: string,
  product: AdminProductInput,
): Promise<Product> {
  const response = await fetch(apiUrl("/api/products"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(product),
  });

  const data = (await response.json().catch(() => ({}))) as Product & {
    error?: string;
    message?: string;
  };

  if (!response.ok) {
    const error = Object.assign(
      new Error(
        data.error ?? data.message ?? "ارتباط با سرور انجام نشد.",
      ),
      { status: response.status },
    );

    throw error;
  }

  return data;
}

export async function getAdminOrders(token: string): Promise<AdminOrder[]> {
  const response = await fetch(apiUrl("/api/admin/orders"), {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw responseError(data, response.status);
  }

  if (!isRecord(data) || !Array.isArray(data.orders)) {
    throw new Error("پاسخ فهرست سفارش‌ها از سرور معتبر نیست.");
  }

  return data.orders as AdminOrder[];
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: string,
  status: AdminOrderStatus,
): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/admin/orders/${encodeURIComponent(orderId)}/status`),
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    },
  );
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw responseError(data, response.status);
  }
}

export async function markAdminOrderPaid(
  token: string,
  orderId: string,
): Promise<void> {
  const response = await fetch(
    apiUrl(`/api/admin/orders/${encodeURIComponent(orderId)}/payment`),
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw responseError(data, response.status);
  }
}

async function readJsonResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function responseError(data: unknown, status: number): Error {
  if (isRecord(data)) {
    const message =
      typeof data.error === "string"
        ? data.error
        : typeof data.message === "string"
          ? data.message
          : "";
    if (message) {
      return Object.assign(new Error(message), { status });
    }
  }

  return Object.assign(new Error(`درخواست با خطای ${status} مواجه شد.`), {
    status,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
