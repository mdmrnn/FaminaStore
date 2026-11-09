import "./env.js";

function getZarinpalConfig() {
  const enabled = readBoolean("ZARINPAL_ENABLED", false);
  const sandbox = readBoolean("ZARINPAL_SANDBOX", true);
  const merchantId = process.env.ZARINPAL_MERCHANT_ID?.trim().toLowerCase() ?? "";
  const production = process.env.NODE_ENV === "production";

  if (!enabled) {
    return {
      enabled,
      sandbox,
      merchantId: merchantId || null,
      frontendUrl: readOptionalPublicOrigin("FRONTEND_URL", production),
      backendPublicUrl: readOptionalPublicOrigin(
        "BACKEND_PUBLIC_URL",
        production,
      ),
    };
  }

  if (!merchantId || isPlaceholder(merchantId)) {
    throw new Error(
      "ZARINPAL_ENABLED is true, but ZARINPAL_MERCHANT_ID is missing or still a placeholder.",
    );
  }

  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(merchantId)) {
    throw new Error("ZARINPAL_MERCHANT_ID must be a valid UUID.");
  }

  return {
    enabled,
    sandbox,
    merchantId,
    frontendUrl: readPublicOrigin("FRONTEND_URL", production),
    backendPublicUrl: readPublicOrigin("BACKEND_PUBLIC_URL", production),
  };
}

export const zarinpalConfig = getZarinpalConfig();

function readBoolean(name, defaultValue) {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return defaultValue;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be set to true or false.`);
}

function readPublicOrigin(name, production) {
  const rawValue = process.env[name]?.trim();

  if (!rawValue || isPlaceholder(rawValue)) {
    throw new Error(`${name} is missing or still a placeholder.`);
  }

  let url;

  try {
    url = new URL(rawValue);
  } catch {
    throw new Error(`${name} must be a valid public HTTP or HTTPS origin.`);
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must contain only an HTTP or HTTPS origin.`);
  }

  if (production && url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production.`);
  }

  return url.origin;
}

function readOptionalPublicOrigin(name, production) {
  try {
    return process.env[name]?.trim()
      ? readPublicOrigin(name, production)
      : null;
  } catch {
    return null;
  }
}

function isPlaceholder(value) {
  return /(?:replace|placeholder|example\.com|your[-_ ]|<[^>]*>)/i.test(value);
}
