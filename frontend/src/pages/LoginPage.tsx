import { useState, type FormEvent } from "react";
import { ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  loginCustomer,
  registerCustomer,
} from "../services/customerAuthApi";

type AuthMode = "login" | "register";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== passwordConfirmation) {
      setError("تکرار رمز عبور با رمز اصلی یکسان نیست.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "register") {
        await registerCustomer(email, password);
      } else {
        await loginCustomer(email, password);
      }

      navigate("/profile", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "ورود به حساب انجام نشد.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setPassword("");
    setPasswordConfirmation("");
    setError("");
  }

  const isRegistering = mode === "register";

  return (
    <main
      dir="rtl"
      className="min-h-[65vh] bg-[#FAF9F5] px-4 py-12 font-[Vazirmatn,sans-serif] text-[#222222] sm:py-16"
    >
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#E7E5DF] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EFEA] text-[#173C35]">
            {isRegistering ? (
              <Mail size={22} strokeWidth={1.7} />
            ) : (
              <LockKeyhole size={22} strokeWidth={1.7} />
            )}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-[#173C35]">
            {isRegistering ? "ساخت حساب کاربری" : "ورود به حساب"}
          </h1>
          <p className="mt-2 text-sm leading-7 text-[#71717A]">
            {isRegistering
              ? "با ایمیل و رمز عبور خود حساب بسازید."
              : "برای ورود، ایمیل و رمز عبورتان را وارد کنید."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#4B4B4B]">
              ایمیل
            </span>
            <input
              required
              type="email"
              dir="ltr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              maxLength={254}
              className="h-12 w-full rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 text-left text-sm outline-none transition-colors focus:border-[#173C35]"
              placeholder="name@example.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-[#4B4B4B]">
              رمز عبور
            </span>
            <input
              required
              type="password"
              dir="ltr"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              className="h-12 w-full rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 text-left text-sm outline-none transition-colors focus:border-[#173C35]"
              placeholder="حداقل ۸ نویسه"
            />
          </label>

          {isRegistering && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[#4B4B4B]">
                تکرار رمز عبور
              </span>
              <input
                required
                type="password"
                dir="ltr"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                className="h-12 w-full rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 text-left text-sm outline-none transition-colors focus:border-[#173C35]"
              />
            </label>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#173C35] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#122f2a] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting
              ? "لطفاً صبر کنید..."
              : isRegistering
                ? "ثبت‌نام"
                : "ورود"}
            <ArrowLeft size={17} />
          </button>
        </form>

        <div className="mt-5 rounded-2xl bg-[#FAF9F5] px-4 py-3 text-xs leading-6 text-[#71717A]">
          ایمیل در این مرحله تأیید نمی‌شود و بازیابی خودکار رمز عبور فعال نیست؛
          رمزتان را در جای امن نگه دارید.
        </div>

        <p className="mt-5 text-center text-sm text-[#71717A]">
          {isRegistering ? "قبلاً حساب ساخته‌اید؟" : "حساب کاربری ندارید؟"}{" "}
          <button
            type="button"
            onClick={() => changeMode(isRegistering ? "login" : "register")}
            className="font-semibold text-[#173C35] underline decoration-[#B8944E] underline-offset-4"
          >
            {isRegistering ? "وارد شوید" : "ثبت‌نام کنید"}
          </button>
        </p>

        <Link
          to="/"
          className="mt-5 block text-center text-xs text-[#8A8A8E] hover:text-[#173C35]"
        >
          بازگشت به فروشگاه
        </Link>
      </section>
    </main>
  );
}
