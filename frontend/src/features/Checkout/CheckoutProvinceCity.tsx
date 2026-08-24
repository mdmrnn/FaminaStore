import { ChevronDown } from "lucide-react";
import type { CheckoutFormData } from "../../pages/CheckoutPage";

interface CheckoutProvinceCityProps {
  formData: CheckoutFormData;
  updateField: <K extends keyof CheckoutFormData>(
    field: K,
    value: CheckoutFormData[K],
  ) => void;
}

export default function CheckoutProvinceCity({
  formData,
  updateField,
}: CheckoutProvinceCityProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
          استان
        </span>

        <div className="relative">
          <select
            value={formData.province}
            onChange={(event) => updateField("province", event.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white px-3.5 pl-9 text-sm text-[#222222] outline-none focus:border-[#173C35]"
          >
            <option value="تهران">تهران</option>
            <option value="البرز">البرز</option>
            <option value="اصفهان">اصفهان</option>
            <option value="فارس">فارس</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8E]"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
          شهر
        </span>

        <div className="relative">
          <select
            value={formData.city}
            onChange={(event) => updateField("city", event.target.value)}
            className="h-12 w-full appearance-none rounded-2xl border border-stone-200 bg-white px-3.5 pl-9 text-sm text-[#222222] outline-none focus:border-[#173C35]"
          >
            <option value="تهران">تهران</option>
            <option value="کرج">کرج</option>
            <option value="اصفهان">اصفهان</option>
            <option value="شیراز">شیراز</option>
          </select>

          <ChevronDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8E]"
          />
        </div>
      </label>
    </div>
  );
}
