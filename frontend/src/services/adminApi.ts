import type { Product } from "../types/product";

const API_BASE_URL = "http://localhost:5000";

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
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
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
  const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
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
  const response = await fetch(`${API_BASE_URL}/api/products`, {
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
