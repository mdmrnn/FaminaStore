import { allowedOrigins } from "../config/corsOrigins.js";
import {
  findCustomerForSession,
  sessionLifetimeSeconds,
} from "../services/customerAuthService.js";

export const customerSessionCookieName = "famina_customer_session";

export function readCustomerSessionToken(req) {
  const cookieHeader = req.get("cookie") ?? "";

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");

    if (
      separator < 0 ||
      part.slice(0, separator).trim() !== customerSessionCookieName
    ) {
      continue;
    }

    const token = part.slice(separator + 1).trim();
    return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : null;
  }

  return null;
}

export function setCustomerSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${customerSessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionLifetimeSeconds}${secure}`,
  );
}

export function clearCustomerSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${customerSessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
  );
}

export function requireTrustedRequestOrigin(req, res, next) {
  const origin = req.get("origin");

  if (origin && !allowedOrigins.has(origin)) {
    return res.status(403).json({ error: "مبدأ درخواست مجاز نیست." });
  }

  return next();
}

export async function requireCustomer(req, res, next) {
  try {
    const token = readCustomerSessionToken(req);

    if (!token) {
      return res.status(401).json({ error: "برای ادامه وارد حساب شوید." });
    }

    const customer = await findCustomerForSession(token);

    if (!customer) {
      return res.status(401).json({ error: "نشست ورود منقضی شده است." });
    }

    req.customer = {
      id: customer.id,
      email: customer.email,
      createdAt: customer.created_at,
      emailVerified: false,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
