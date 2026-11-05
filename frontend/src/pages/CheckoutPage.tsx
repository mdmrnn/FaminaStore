import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";
import type { AppDispatch } from "../store/store";
import { clearCart } from "../store/cartSlice";

import CheckoutHeader from "../features/Checkout/CheckoutHeader";
import CheckoutShippingForm from "../features/Checkout/CheckoutShippingForm";
import type { Order } from "../services/orderApi";
import { formatPrice } from "../utils/formatNumber";

type PaymentMethod = "manual";
type ShippingMethod = "courier" | "post";

export interface CheckoutFormData {
  fullName: string;
  mobile: string;
  province: string;
  city: string;
  address: string;
  deliveryNote: string;
  saveInformation: boolean;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.cart.items);

  const [step, setStep] = useState<1 | 2>(1);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    mobile: "",
    province: "تهران",
    city: "تهران",
    address: "",
    deliveryNote: "",
    saveInformation: true,
    paymentMethod: "manual",
    shippingMethod: "post",
  });

  useEffect(() => {
    if (items.length === 0 && !createdOrder) {
      navigate("/cart", { replace: true });
    }
  }, [createdOrder, items.length, navigate]);

  const updateField = <K extends keyof CheckoutFormData>(
    field: K,
    value: CheckoutFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFormErrors([]);
  };

  const handleOrderCreated = (order: Order) => {
    setCreatedOrder(order);
    dispatch(clearCart());
    setFormErrors([]);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="mx-auto w-full max-w-md px-3 pb-28 pt-3 sm:max-w-2xl sm:px-5 sm:pb-10 sm:pt-5 lg:max-w-5xl">
        <CheckoutHeader
          step={step}
          setStep={setStep}
          setFormErrors={setFormErrors}
          isOrderCreated={createdOrder !== null}
        />
        {formErrors.length > 0 && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-6 text-[#D9534F]"
          >
            {formErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}
        {step === 1 ? (
          <CheckoutShippingForm
            formData={formData}
            updateField={updateField}
            setFormErrors={setFormErrors}
            onOrderCreated={handleOrderCreated}
          />
        ) : (
          createdOrder && (
            <section className="rounded-3xl border border-[#E7E5DF] bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-[#173C35]">
                سفارش شما ثبت شد
              </h2>
              <p className="mt-2 text-xs leading-6 text-[#71717A]">
                ثبت سفارش شما انجام شد. پرداخت به‌صورت دستی و پس از تماس فروشگاه
                هماهنگ می‌شود.
              </p>

              <div className="mt-5 space-y-3 rounded-2xl bg-[#FAF9F5] p-4 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#71717A]">شناسه سفارش</span>
                  <span className="font-medium text-[#173C35]">
                    {createdOrder.id}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[#71717A]">مبلغ قابل پرداخت</span>
                  <span className="font-bold text-[#173C35]">
                    {formatPrice(createdOrder.total)} تومان
                  </span>
                </div>
              </div>
            </section>
          )
        )}
      </div>
    </main>
  );
}
