import { Tag } from "lucide-react";
import { useState } from "react";

const MAX_DISCOUNT = 100_000;
interface DiscountCardProps {
  appliedDiscount: number;
  setAppliedDiscount: (num: number) => void;
  subtotal: number;
}
export default function CartDiscountCard({
  appliedDiscount,
  setAppliedDiscount,
  subtotal,
}: DiscountCardProps) {
  const [discountCode, setDiscountCode] = useState("");

  const handleApplyDiscount = () => {
    if (!discountCode.trim()) {
      console.log("کد تخفیف وارد نشده است");
      return;
    }
    console.log(`اعمال کد تخفیف: ${discountCode}`);

    // Mock discount for demonstration purposes.
    setAppliedDiscount(Math.min(Math.round(subtotal * 0.1), MAX_DISCOUNT));
  };

  return (
    <section
      aria-label="کد تخفیف"
      className="mt-5 rounded-2xl border border-[#E7E5DF] bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E8EFEA] text-[#173C35]">
          <Tag size={15} strokeWidth={1.6} />
        </div>

        <h2 className="text-sm font-medium text-[#173C35]">کد تخفیف</h2>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={discountCode}
          onChange={(event) => setDiscountCode(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleApplyDiscount();
            }
          }}
          placeholder="کد تخفیف دارید؟"
          aria-label="کد تخفیف"
          className="h-11 min-w-0 flex-1 rounded-xl border border-[#E7E5DF] bg-[#FAF9F5] px-3 text-xs text-[#222222] outline-none transition-colors placeholder:text-[#8A8A8E] focus:border-[#173C35]"
        />

        <button
          type="button"
          onClick={handleApplyDiscount}
          className="h-11 shrink-0 rounded-xl bg-[#E8EFEA] px-5 text-xs font-medium text-[#173C35] transition-colors hover:bg-[#dce7e1] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
        >
          اعمال
        </button>
      </div>

      {appliedDiscount > 0 && (
        <p className="mt-2 text-[10px] text-[#173C35]">
          کد تخفیف با موفقیت اعمال شد.
        </p>
      )}
    </section>
  );
}
