import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function CartHeader() {
  const navigate = useNavigate();
  return (
    <header className="mb-5">
      <div className="relative flex h-11 items-center justify-center">
        <button
          type="button"
          aria-label="بازگشت"
          onClick={() => navigate("/products")}
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
        >
          <ArrowRight size={19} strokeWidth={1.7} />
        </button>
        <h1 className="text-lg font-bold text-[#173C35]">سبد خرید</h1>
      </div>

      <div className="mt-5 flex items-center px-2">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full  bg-[#B8944E] text-[11px] font-medium text-white">
            ۱
          </span>
          <span className="text-[9px] font-medium text-[#B8944E]">
            سبد خرید
          </span>
        </div>

        <span className="mb-4 h-px flex-1 bg-[#B8944E]" />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[11px] text-[#8A8A8E] font-medium">
            ۲
          </span>
          <span className="text-[9px] text-[#8A8A8E] ">اطلاعات ارسال</span>
        </div>

        <span className="mb-4 h-px flex-1 bg-[#E7E5DF]" />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[11px] text-[#8A8A8E]">
            ۳
          </span>
          <span className="text-[9px] text-[#8A8A8E]">پرداخت</span>
        </div>
      </div>
    </header>
  );
}
