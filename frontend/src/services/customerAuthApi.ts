import { apiUrl } from "./apiBase";

export interface CustomerAccount {
  id: string;
  email: string;
  createdAt: string;
  emailVerified: false;
}

interface CustomerResponse {
  user?: CustomerAccount;
  error?: string;
}

export async function registerCustomer(
  email: string,
  password: string,
): Promise<CustomerAccount> {
  return submitCredentials("register", email, password);
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<CustomerAccount> {
  return submitCredentials("login", email, password);
}

async function submitCredentials(
  action: "register" | "login",
  email: string,
  password: string,
): Promise<CustomerAccount> {
  const response = await fetch(apiUrl(`/api/auth/${action}`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await readResponse(response)) as CustomerResponse;

  if (!response.ok) {
    throw responseError(data, response.status);
  }

  if (!data.user) {
    throw new Error("پاسخ ورود از سرور معتبر نیست.");
  }

  return data.user;
}

export async function getCurrentCustomer(): Promise<CustomerAccount> {
  const response = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
  });
  const data = (await readResponse(response)) as CustomerResponse;

  if (!response.ok) {
    throw responseError(data, response.status);
  }

  if (!data.user) {
    throw new Error("اطلاعات حساب از سرور دریافت نشد.");
  }

  return data.user;
}

export async function logoutCustomer(): Promise<void> {
  const response = await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const data = (await readResponse(response)) as CustomerResponse;
    throw responseError(data, response.status);
  }
}

async function readResponse(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function responseError(data: unknown, status: number): Error {
  if (typeof data === "object" && data !== null) {
    const message = (data as CustomerResponse).error;
    if (message) {
      return Object.assign(new Error(message), { status });
    }
  }

  return Object.assign(new Error("ارتباط با سرور برقرار نشد."), { status });
}
