import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAdminOrders,
  markAdminOrderPaid,
  updateAdminOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
} from "../services/adminApi";
import { formatPrice } from "../utils/formatNumber";

const sessionStorageKey = "famina-admin-token";

const statusLabels: Record<AdminOrderStatus, string> = {
  pending: "در انتظار بررسی",
  confirmed: "تأیید شده",
  preparing: "در حال آماده‌سازی",
  shipped: "ارسال شده",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

const nextStatuses: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [token] = useState(
    () => window.sessionStorage.getItem(sessionStorageKey) ?? "",
  );
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyOrderId, setBusyOrderId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin", { replace: true });
      return;
    }

    let cancelled = false;
    getAdminOrders(token)
      .then((result) => {
        if (!cancelled) setOrders(result);
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        if (getErrorStatus(loadError) === 401) {
          window.sessionStorage.removeItem(sessionStorageKey);
          navigate("/admin", { replace: true });
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "دریافت سفارش‌ها انجام نشد.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshKey, token]);

  async function handleStatusChange(
    orderId: string,
    status: AdminOrderStatus,
  ) {
    setError("");
    setBusyOrderId(orderId);
    try {
      await updateAdminOrderStatus(token, orderId, status);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        ),
      );
    } catch (updateError) {
      if (getErrorStatus(updateError) === 401) {
        window.sessionStorage.removeItem(sessionStorageKey);
        navigate("/admin", { replace: true });
      } else {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "به‌روزرسانی سفارش انجام نشد.",
        );
      }
    } finally {
      setBusyOrderId("");
    }
  }

  async function handleMarkPaid(orderId: string) {
    setError("");
    setBusyOrderId(orderId);
    try {
      await markAdminOrderPaid(token, orderId);
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, paymentStatus: "paid" }
            : order,
        ),
      );
    } catch (updateError) {
      if (getErrorStatus(updateError) === 401) {
        window.sessionStorage.removeItem(sessionStorageKey);
        navigate("/admin", { replace: true });
      } else {
        setError(
          updateError instanceof Error
            ? updateError.message
            : "به‌روزرسانی پرداخت انجام نشد.",
        );
      }
    } finally {
      setBusyOrderId("");
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF9F5] px-4 py-8 font-[Vazirmatn,sans-serif] text-[#222222] sm:px-6"
    >
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#6D6D6D]">فروشگاه فامینا</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#173C35]">
              سفارش‌ها
            </h1>
          </div>
          <Link
            to="/admin"
            className="rounded-xl border border-[#E7E5DF] bg-white px-4 py-2 text-sm text-[#173C35]"
          >
            مدیریت محصولات
          </Link>
        </header>

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setError("");
              setLoading(true);
              setRefreshKey((current) => current + 1);
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-[#E7E5DF] bg-white px-4 py-2 text-sm text-[#173C35] disabled:opacity-50"
          >
            <RefreshCw size={16} aria-hidden="true" />
            تازه‌سازی سفارش‌ها
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {loading ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-[#6D6D6D]">
            در حال دریافت سفارش‌ها…
          </p>
        ) : orders.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-sm text-[#6D6D6D]">
            هنوز سفارشی ثبت نشده است.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-[#E7E5DF] bg-white p-4 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0EEE8] pb-4">
                  <div>
                    <h2 className="font-semibold text-[#173C35]">
                      سفارش {order.id}
                    </h2>
                    <p className="mt-1 text-xs text-[#6D6D6D]">
                      {formatCreatedAt(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-[#F7F4E9] px-3 py-1.5 text-[#8A6A20]">
                      {statusLabels[order.status]}
                    </span>
                    <span className="rounded-full bg-[#E8EFEA] px-3 py-1.5 text-[#173C35]">
                      {order.paymentStatus === "paid"
                        ? "پرداخت‌شده"
                        : "پرداخت‌نشده"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-5 py-4 md:grid-cols-2">
                  <section className="space-y-1.5 text-sm">
                    <h3 className="font-medium text-[#173C35]">گیرنده</h3>
                    <p>{order.customer.fullName}</p>
                    <a
                      className="text-[#426C63] underline"
                      href={`tel:${order.customer.mobile}`}
                    >
                      {order.customer.mobile}
                    </a>
                    <p className="leading-6 text-[#6D6D6D]">
                      {order.customer.province}، {order.customer.city}،{" "}
                      {order.customer.address}
                    </p>
                    {order.customer.deliveryNote && (
                      <p className="text-xs text-[#6D6D6D]">
                        یادداشت: {order.customer.deliveryNote}
                      </p>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-2 font-medium text-[#173C35]">
                      اقلام سفارش
                    </h3>
                    <ul className="space-y-2 text-sm">
                      {order.items.map((item, index) => (
                        <li
                          key={`${order.id}-${item.productId}-${index}`}
                          className="flex justify-between gap-3"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span className="whitespace-nowrap">
                            {formatPrice(item.totalPrice)} تومان
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-[#F0EEE8] pt-3 text-sm">
                      <p className="flex justify-between gap-3">
                        <span>ارسال</span>
                        <span>
                          {order.shippingCost === 0
                            ? "رایگان"
                            : `${formatPrice(order.shippingCost)} تومان`}
                        </span>
                      </p>
                      <p className="flex justify-between gap-3 font-semibold text-[#173C35]">
                        <span>جمع کل</span>
                        <span>{formatPrice(order.total)} تومان</span>
                      </p>
                    </div>
                  </section>
                </div>

                <div className="flex flex-wrap items-center gap-3 border-t border-[#F0EEE8] pt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <span>تغییر وضعیت</span>
                    <select
                      aria-label={`وضعیت سفارش ${order.id}`}
                      value={order.status}
                      disabled={
                        busyOrderId === order.id ||
                        nextStatuses[order.status].length === 0
                      }
                      onChange={(event) =>
                        void handleStatusChange(
                          order.id,
                          event.target.value as AdminOrderStatus,
                        )
                      }
                      className="rounded-lg border border-[#D8D6CF] bg-white px-3 py-2"
                    >
                      <option value={order.status}>
                        {statusLabels[order.status]}
                      </option>
                      {nextStatuses[order.status].map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                  </label>

                  {order.paymentStatus === "unpaid" &&
                    order.status !== "cancelled" && (
                      <button
                        type="button"
                        disabled={busyOrderId === order.id}
                        onClick={() => void handleMarkPaid(order.id)}
                        className="rounded-lg bg-[#173C35] px-3 py-2 text-sm text-white disabled:opacity-50"
                      >
                        ثبت دریافت وجه دستی
                      </button>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getErrorStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return undefined;
  }

  const status = error.status;
  return typeof status === "number" ? status : undefined;
}
