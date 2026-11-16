import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentCustomer,
  logoutCustomer,
  type CustomerAccount,
} from "../services/customerAuthApi";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getCurrentCustomer()
      .then((account) => {
        if (isCurrent) {
          setCustomer(account);
        }
      })
      .catch((loadError: unknown) => {
        if (!isCurrent) {
          return;
        }

        const status =
          typeof loadError === "object" && loadError !== null && "status" in loadError
            ? loadError.status
            : undefined;

        if (status === 401) {
          navigate("/login", { replace: true });
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "دریافت اطلاعات حساب انجام نشد.",
        );
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  async function handleLogout() {
    setIsLoggingOut(true);
    setError("");

    try {
      await logoutCustomer();
      navigate("/login", { replace: true });
    } catch (logoutError) {
      setError(
        logoutError instanceof Error
          ? logoutError.message
          : "خروج از حساب انجام نشد.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-[65vh] bg-[#FAF9F5] px-4 py-12 font-[Vazirmatn,sans-serif] text-[#222222] sm:py-16"
    >
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-[#E7E5DF] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-medium text-[#B8944E]">حساب کاربری</p>
        <h1 className="mt-2 text-2xl font-bold text-[#173C35]">پروفایل شما</h1>

        {isLoading ? (
          <p className="mt-6 text-sm text-[#71717A]">در حال دریافت اطلاعات...</p>
        ) : customer ? (
          <>
            <div className="mt-6 rounded-2xl bg-[#FAF9F5] p-4 sm:p-5">
              <p className="text-xs text-[#71717A]">ایمیل حساب</p>
              <p
                className="mt-2 break-all text-left text-sm font-medium text-[#173C35]"
                dir="ltr"
              >
                {customer.email}
              </p>
            </div>
            <p className="mt-4 text-sm leading-7 text-[#71717A]">
              ایمیل این حساب هنوز تأیید نشده است. تا زمان راه‌اندازی ارسال ایمیل،
              امکان بازیابی خودکار رمز عبور وجود ندارد.
            </p>
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-2xl border border-[#173C35] px-5 text-sm font-semibold text-[#173C35] transition-colors hover:bg-[#E8EFEA] disabled:opacity-60"
            >
              {isLoggingOut ? "در حال خروج..." : "خروج از حساب"}
            </button>
          </>
        ) : (
          <div className="mt-6">
            <p role="alert" className="text-sm leading-7 text-red-700">
              {error}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-2xl bg-[#173C35] px-5 py-3 text-sm font-semibold text-white"
            >
              تلاش دوباره
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
