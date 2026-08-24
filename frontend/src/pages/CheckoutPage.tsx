import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";

import CheckoutHeader from "../features/Checkout/CheckoutHeader";
import CheckoutShippingForm from "../features/Checkout/CheckoutShippingForm";

// type PaymentMethod = "online" | "cod";
type PaymentMethod = "online";
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

  const items = useSelector((state: RootState) => state.cart.items);

  const [step, setStep] = useState<1 | 2>(1);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: "",
    mobile: "",
    province: "تهران",
    city: "تهران",
    address: "",
    deliveryNote: "",
    saveInformation: true,
    paymentMethod: "online",
    shippingMethod: "post",
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

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
        <CheckoutShippingForm
          formData={formData}
          updateField={updateField}
          setFormErrors={setFormErrors}
        />
      </div>
    </main>
  );
}
