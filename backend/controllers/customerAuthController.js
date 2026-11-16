import {
  isValidCustomerEmail,
  isValidCustomerPassword,
  loginCustomer as authenticateCustomer,
  normalizeCustomerEmail,
  registerCustomer as createCustomer,
  revokeCustomerSession,
} from "../services/customerAuthService.js";
import {
  clearCustomerSessionCookie,
  readCustomerSessionToken,
  setCustomerSessionCookie,
} from "../middleware/customerAuth.js";

function setPrivateResponseHeaders(res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
}

function validateCredentials(req, res) {
  const email = req.body?.email;
  const password = req.body?.password;

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "ایمیل و رمز عبور را وارد کنید." });
    return null;
  }

  const normalizedEmail = normalizeCustomerEmail(email);

  if (!isValidCustomerEmail(normalizedEmail)) {
    res.status(400).json({ error: "یک نشانی ایمیل معتبر وارد کنید." });
    return null;
  }

  if (!isValidCustomerPassword(password)) {
    res.status(400).json({ error: "رمز عبور باید بین ۸ تا ۱۲۸ نویسه باشد." });
    return null;
  }

  return { email: normalizedEmail, password };
}

export async function registerCustomer(req, res, next) {
  setPrivateResponseHeaders(res);
  const credentials = validateCredentials(req, res);

  if (!credentials) {
    return;
  }

  try {
    const { customer, token } = await createCustomer(
      credentials.email,
      credentials.password,
    );
    setCustomerSessionCookie(res, token);
    return res.status(201).json({ user: customer });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "این ایمیل قبلاً ثبت شده است؛ وارد حساب شوید.",
      });
    }

    return next(error);
  }
}

export async function loginCustomer(req, res, next) {
  setPrivateResponseHeaders(res);
  const credentials = validateCredentials(req, res);

  if (!credentials) {
    return;
  }

  try {
    const result = await authenticateCustomer(
      credentials.email,
      credentials.password,
    );

    if (!result) {
      return res.status(401).json({ error: "ایمیل یا رمز عبور درست نیست." });
    }

    setCustomerSessionCookie(res, result.token);
    return res.status(200).json({ user: result.customer });
  } catch (error) {
    return next(error);
  }
}

export function getCurrentCustomer(req, res) {
  setPrivateResponseHeaders(res);
  return res.status(200).json({ user: req.customer });
}

export async function logoutCustomer(req, res, next) {
  setPrivateResponseHeaders(res);
  const token = readCustomerSessionToken(req);

  try {
    if (token) {
      await revokeCustomerSession(token);
    }

    clearCustomerSessionCookie(res);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}
