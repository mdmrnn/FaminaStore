import { Check, Truck } from "lucide-react";
import type { RootState } from "../../store/store";

import type { CheckoutFormData } from "../../pages/CheckoutPage";
import CheckoutProvinceCity from "./CheckoutProvinceCity";
import { useSelector } from "react-redux";

interface CheckoutShippingFormProps {
  formData: CheckoutFormData;
  updateField: <K extends keyof CheckoutFormData>(
    field: K,
    value: CheckoutFormData[K],
  ) => void;
  setFormErrors: (err: string[]) => void;
}

export default function CheckoutShippingForm({
  formData,
  updateField,
  setFormErrors,
}: CheckoutShippingFormProps) {
  const items = useSelector((state: RootState) => state.cart.items);

  const validateShippingForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.fullName.trim()) {
      errors.push("نام و نام خانوادگی را وارد کنید.");
    }

    if (!/^09\d{9}$/.test(formData.mobile.replace(/\s/g, ""))) {
      errors.push("شماره موبایل معتبر وارد کنید.");
    }

    if (!formData.province) {
      errors.push("استان را انتخاب کنید.");
    }

    if (!formData.city) {
      errors.push("شهر را انتخاب کنید.");
    }

    if (formData.address.trim().length < 10) {
      errors.push("آدرس دقیق را کامل وارد کنید.");
    }

    setFormErrors(errors);

    return errors.length === 0;
  };

  const handleSubmitOrder = () => {
    if (!validateShippingForm()) {
      return;
    }

    console.log("ادامه به پرداخت");
    // setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-[#E7E5DF] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-5">
          <h2 className="text-base font-bold text-[#173C35]">آدرس ارسال</h2>
          <p className="mt-1 text-[10px] text-[#8A8A8E]">
            اطلاعات گیرنده و محل تحویل سفارش را وارد کنید.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
              نام و نام خانوادگی
            </span>
            <input
              type="text"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="مبینا حسینی"
              autoComplete="name"
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3.5 text-sm text-[#222222] outline-none transition-colors placeholder:text-stone-300 focus:border-[#173C35]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
              شماره موبایل
            </span>
            <input
              type="tel"
              dir="rtl"
              value={formData.mobile}
              onChange={(event) => updateField("mobile", event.target.value)}
              placeholder="۴۵۶۷ ۱۲۳ ۰۹۱۲"
              autoComplete="tel"
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3.5 text-sm text-[#222222] outline-none transition-colors placeholder:text-stone-300 focus:border-[#173C35]"
            />
          </label>

          <CheckoutProvinceCity formData={formData} updateField={updateField} />

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
              آدرس دقیق
            </span>

            <textarea
              value={formData.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="خیابان ولیعصر، روبروی پارک ملت، پلاک ۱۱۱، واحد ۶"
              rows={3}
              className="w-full resize-none rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-sm leading-6 text-[#222222] outline-none transition-colors placeholder:text-stone-300 focus:border-[#173C35]"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
              یادداشت اختیاری برای ارسال
            </span>

            <input
              type="text"
              value={formData.deliveryNote}
              onChange={(event) =>
                updateField("deliveryNote", event.target.value)
              }
              placeholder="مثلاً قبل از تحویل با من تماس بگیرید"
              className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-3.5 text-sm text-[#222222] outline-none transition-colors placeholder:text-stone-300 focus:border-[#173C35]"
            />
          </label>

          <label className="flex cursor-pointer items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              checked={formData.saveInformation}
              onChange={(event) =>
                updateField("saveInformation", event.target.checked)
              }
              className="peer sr-only"
            />

            <span className="flex h-5 w-5 items-center justify-center rounded-md border border-[#E7E5DF] bg-white text-transparent transition-all peer-checked:border-[#173C35] peer-checked:bg-[#173C35] peer-focus-visible:ring-2 peer-focus-visible:ring-[#B8944E]">
              <Check size={13} strokeWidth={2.5} />
            </span>

            <span className="text-xs text-[#71717A]">
              ذخیره اطلاعات برای خرید بعدی
            </span>
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-[#E7E5DF] bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-sm font-bold text-[#173C35]">روش ارسال</h2>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => updateField("shippingMethod", "courier")}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition-all ${
              formData.shippingMethod === "courier"
                ? "border-[#173C35] bg-[#E8EFEA]"
                : "border-[#E7E5DF] bg-white hover:bg-[#FAF9F5]"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                formData.shippingMethod === "courier"
                  ? "bg-[#173C35] text-white"
                  : "bg-[#E8EFEA] text-[#173C35]"
              }`}
            >
              <Truck size={18} strokeWidth={1.7} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-[#222222]">
                پیک موتوری
              </span>
              <span className="mt-1 block text-[10px] text-[#8A8A8E]">
                ویژه تهران - تحویل امروز
              </span>
            </span>

            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                formData.shippingMethod === "courier"
                  ? "border-[#173C35] bg-[#173C35] text-white"
                  : "border-[#D6D3D1] bg-white"
              }`}
            >
              {formData.shippingMethod === "courier" && (
                <Check size={12} strokeWidth={2.5} />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => updateField("shippingMethod", "post")}
            className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-right transition-all ${
              formData.shippingMethod === "post"
                ? "border-[#173C35] bg-[#E8EFEA]"
                : "border-[#E7E5DF] bg-white hover:bg-[#FAF9F5]"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                formData.shippingMethod === "post"
                  ? "bg-[#173C35] text-white"
                  : "bg-[#E8EFEA] text-[#173C35]"
              }`}
            >
              <Truck size={18} strokeWidth={1.7} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-[#222222]">
                پست پیشتاز
              </span>
              <span className="mt-1 block text-[10px] text-[#8A8A8E]">
                ۲ الی ۳ روز کاری
              </span>
            </span>

            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                formData.shippingMethod === "post"
                  ? "border-[#173C35] bg-[#173C35] text-white"
                  : "border-[#D6D3D1] bg-white"
              }`}
            >
              {formData.shippingMethod === "post" && (
                <Check size={12} strokeWidth={2.5} />
              )}
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmitOrder}
        className="h-14 w-full rounded-2xl bg-[#173C35] px-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#122f2a] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2"
      >
        ادامه به پرداخت
      </button>
    </section>
  );
}
