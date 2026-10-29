import { randomBytes, timingSafeEqual } from "node:crypto";

const sessions = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

function matchesConfiguredCredential(candidate, configuredValue) {
  if (typeof candidate !== "string" || !configuredValue) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidate);
  const configuredBuffer = Buffer.from(configuredValue);

  return (
    candidateBuffer.length === configuredBuffer.length &&
    timingSafeEqual(candidateBuffer, configuredBuffer)
  );
}

export function loginAdmin(req, res) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return res.status(503).json({ error: "ورود مدیر پیکربندی نشده است." });
  }

  if (
    !matchesConfiguredCredential(req.body?.username, username) ||
    !matchesConfiguredCredential(req.body?.password, password)
  ) {
    return res.status(401).json({ error: "نام کاربری یا رمز عبور نادرست است." });
  }

  const now = Date.now();
  for (const [token, expiresAt] of sessions) {
    if (expiresAt <= now) {
      sessions.delete(token);
    }
  }

  const token = randomBytes(32).toString("base64url");
  sessions.set(token, now + sessionLifetimeMs);

  return res.status(200).json({ token, expiresIn: sessionLifetimeMs });
}

export function requireAdmin(req, res, next) {
  const authorization = req.get("authorization") ?? "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1];
  const expiresAt = token ? sessions.get(token) : undefined;

  if (!expiresAt || expiresAt <= Date.now()) {
    if (token) {
      sessions.delete(token);
    }
    return res.status(401).json({ error: "ورود مدیر معتبر نیست؛ دوباره وارد شوید." });
  }

  req.adminToken = token;
  return next();
}

export function logoutAdmin(req, res) {
  sessions.delete(req.adminToken);
  return res.status(204).end();
}
