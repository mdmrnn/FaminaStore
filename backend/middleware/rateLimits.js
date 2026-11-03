import { rateLimit } from "express-rate-limit";

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "تعداد تلاش‌های ورود بیش از حد مجاز است." },
});

export const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "تعداد ثبت سفارش در این بازه بیش از حد مجاز است." },
});
