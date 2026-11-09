import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { clearCart } from "../store/cartSlice";
import type { AppDispatch } from "../store/store";
import {
  getOrderPaymentStatus,
  startOrderPayment,
  verifyOrderPayment,
  type OrderPaymentSummary,
} from "../services/orderApi";
import { formatPrice } from "../utils/formatNumber";

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const orderId = searchParams.get("orderId");
  const [payment, setPayment] = useState<OrderPaymentSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    if (!orderId) {
      return () => {
        isActive = false;
      };
    }

    getOrderPaymentStatus(orderId)
      .then((summary) => {
        if (!isActive) {
          return;
        }

        setPayment(summary);
        setLoadError(null);
        setLoadedOrderId(orderId);
        if (summary.paymentStatus === "paid") {
          dispatch(clearCart());
        }
      })
      .catch((error) => {
        if (isActive) {
          setLoadedOrderId(orderId);
          setLoadError(
            error instanceof Error
              ? error.message
              : "وضعیت سفارش دریافت نشد.",
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [dispatch, orderId, refreshCount]);

  const handleRefreshStatus = () => {
    setIsLoading(true);
    setLoadError(null);
    setRefreshCount((count) => count + 1);
  };

  const handleVerifyAgain = async () => {
    if (!orderId) {
      return;
    }

    setIsActing(true);
    setActionError(null);

    try {
      await verifyOrderPayment(orderId);
      setRefreshCount((count) => count + 1);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "بررسی پرداخت انجام نشد.",
      );
    } finally {
      setIsActing(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId) {
      return;
    }

    setIsActing(true);
    setActionError(null);

    try {
      const redirectUrl = await startOrderPayment(orderId);
      window.location.assign(redirectUrl);
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "شروع دوبارهٔ پرداخت نشد.",
      );
    } finally {
      setIsActing(false);
    }
  };

  const isPaid = payment?.paymentStatus === "paid";
  const waitingForCurrentOrder =
    isLoading || (orderId !== null && loadedOrderId !== orderId);

  return (
    <main
      dir="rtl"
      className="min-h-[60vh] bg-[#FAF9F5] px-3 py-10 font-[Vazirmatn,sans-serif] text-[#222222] sm:px-5"
    >
      <section className="mx-auto max-w-xl rounded-3xl border border-[#E7E5DF] bg-white p-5 shadow-sm sm:p-7">
        <h1 className="text-lg font-bold text-[#173C35]">
          {isPaid ? "پرداخت با موفقیت تأیید شد" : "وضعیت پرداخت سفارش"}
        </h1>

        {!orderId ? (
          <p role="alert" className="mt-4 text-sm leading-7 text-[#D9534F]">
            شناسهٔ سفارش در آدرس صفحه وجود ندارد.
          </p>
        ) : waitingForCurrentOrder ? (
          <p className="mt-4 text-sm leading-7 text-[#71717A]">
            در حال دریافت وضعیت از سرور…
          </p>
        ) : loadError ? (
          <div role="alert" className="mt-4 text-sm leading-7 text-[#D9534F]">
            {loadError}
            {orderId && (
              <button
                type="button"
                onClick={handleRefreshStatus}
                className="mt-3 block rounded-xl border border-[#E7E5DF] px-4 py-2 text-xs font-medium text-[#173C35]"
              >
                بررسی دوباره
              </button>
            )}
          </div>
        ) : payment ? (
          <>
            <p className="mt-3 text-sm leading-7 text-[#71717A]">
              {isPaid
                ? "پرداخت از سمت زرین‌پال تأیید شده و سفارش شما ثبت نهایی شد."
                : payment.attemptStatus === "cancelled"
                  ? "پرداخت لغو شد و مبلغی به‌عنوان پرداخت‌شده برای سفارش ثبت نشده است."
                  : payment.attemptStatus === "failed"
                    ? "پرداخت لغو شد یا تأیید نشد. می‌توانید دوباره تلاش کنید."
                    : "پرداخت هنوز تأیید نشده است. وضعیت را دوباره بررسی کنید یا پرداخت را ادامه دهید."}
            </p>

            <div className="mt-5 space-y-3 rounded-2xl bg-[#FAF9F5] p-4 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#71717A]">شناسه سفارش</span>
                <span className="font-medium text-[#173C35]">{payment.orderId}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[#71717A]">مبلغ سفارش</span>
                <span className="font-bold text-[#173C35]">
                  {formatPrice(payment.total)} تومان
                </span>
              </div>
              {payment.referenceId && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#71717A]">شماره مرجع پرداخت</span>
                  <span className="font-medium text-[#173C35]">
                    {payment.referenceId}
                  </span>
                </div>
              )}
            </div>

            {actionError && (
              <p
                role="alert"
                className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs leading-6 text-[#D9534F]"
              >
                {actionError}
              </p>
            )}

            {!isPaid && (
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                {payment.canVerify && (
                  <button
                    type="button"
                    onClick={handleVerifyAgain}
                    disabled={isActing}
                    className="h-11 flex-1 rounded-xl border border-[#173C35] px-4 text-xs font-semibold text-[#173C35] disabled:opacity-60"
                  >
                    {isActing ? "در حال بررسی…" : "بررسی دوبارهٔ پرداخت"}
                  </button>
                )}
                {payment.canRetry && (
                  <button
                    type="button"
                    onClick={handleRetryPayment}
                    disabled={isActing}
                    className="h-11 flex-1 rounded-xl bg-[#173C35] px-4 text-xs font-semibold text-white disabled:opacity-60"
                  >
                    {isActing ? "در حال اتصال…" : "تلاش دوباره برای پرداخت"}
                  </button>
                )}
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
