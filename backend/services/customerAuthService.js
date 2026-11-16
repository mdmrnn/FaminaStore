import {
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import {
  createCustomerAccount,
  createCustomerSession,
  deleteCustomerSession,
  findCustomerByEmail,
  findCustomerBySessionHash,
} from "../repositories/customerAuthRepository.js";

const scryptAsync = promisify(scrypt);
const passwordKeyLength = 64;
const passwordSaltLength = 16;
const scryptParameters = { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

async function hashPassword(password) {
  const salt = randomBytes(passwordSaltLength).toString("hex");
  const derivedKey = await scryptAsync(
    password,
    salt,
    passwordKeyLength,
    scryptParameters,
  );

  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

async function verifyPassword(password, encodedHash) {
  const [algorithm, salt, expectedHex, extra] = encodedHash.split("$");

  if (
    algorithm !== "scrypt" ||
    !salt ||
    !/^[a-f0-9]{32}$/i.test(salt) ||
    !/^[a-f0-9]{128}$/i.test(expectedHex ?? "") ||
    extra !== undefined
  ) {
    return false;
  }

  const expected = Buffer.from(expectedHex, "hex");
  const actual = await scryptAsync(
    password,
    salt,
    passwordKeyLength,
    scryptParameters,
  );

  return timingSafeEqual(expected, actual);
}

const dummyPasswordHashPromise = hashPassword("invalid-customer-login");
const sessionLifetimeSeconds = 30 * 24 * 60 * 60;

function toPublicCustomer(customer) {
  return {
    id: customer.id,
    email: customer.email,
    createdAt: customer.created_at,
    emailVerified: false,
  };
}

function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

function hashSessionToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export function normalizeCustomerEmail(email) {
  return email.trim().toLowerCase();
}

export function isValidCustomerEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
}

export function isValidCustomerPassword(password) {
  return password.length >= 8 && password.length <= 128;
}

export async function registerCustomer(email, password) {
  const passwordHash = await hashPassword(password);
  const token = createSessionToken();
  const customer = await createCustomerAccount({
    email,
    passwordHash,
    sessionTokenHash: hashSessionToken(token),
  });

  return { customer: toPublicCustomer(customer), token };
}

export async function loginCustomer(email, password) {
  const customer = await findCustomerByEmail(email);
  const passwordHash = customer?.password_hash ?? (await dummyPasswordHashPromise);
  const passwordMatches = await verifyPassword(password, passwordHash);

  if (!customer || !passwordMatches) {
    return null;
  }

  const token = createSessionToken();
  await createCustomerSession(customer.id, hashSessionToken(token));

  return { customer: toPublicCustomer(customer), token };
}

export async function findCustomerForSession(token) {
  return findCustomerBySessionHash(hashSessionToken(token));
}

export async function revokeCustomerSession(token) {
  await deleteCustomerSession(hashSessionToken(token));
}

export { sessionLifetimeSeconds };
