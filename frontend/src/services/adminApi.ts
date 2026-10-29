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

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
  };

  if (!response.ok) {
    throw new AdminApiError(
      data.error ?? "ارتباط با سرور انجام نشد.",
      response.status,
    );
  }

  return data as T;
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
  const result = await readResponse<{ token: string }>(response);
  return result.token;
}

export async function logoutAdmin(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/admin/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 401) {
    await readResponse(response);
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

  return readResponse<Product>(response);
}
