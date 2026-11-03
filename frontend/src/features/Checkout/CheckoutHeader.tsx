import { ArrowRight, Check } from "lucide-react";

import { useNavigate } from "react-router";

interface CheckoutHeaderProps {
  step: number;
  setStep: (num: 1 | 2) => void;
  setFormErrors: (error: string[]) => void;
  isOrderCreated: boolean;
}

export default function CheckoutHeader({
  step,
  setStep,
  setFormErrors,
  isOrderCreated,
}: CheckoutHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (step === 2) {
      if (isOrderCreated) {
        navigate("/products");
        return;
      }
      setStep(1);
      setFormErrors([]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/cart");
  };

  return (
    <header className="mb-6">
      <div className="relative flex h-11 items-center justify-center">
        <button
          type="button"
          aria-label="بازگشت"
          onClick={handleBack}
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
        >
          <ArrowRight size={19} strokeWidth={1.8} />
        </button>
        <h1 className="text-lg font-bold text-[#173C35]">
          {step === 1 ? "اطلاعات ارسال" : "ثبت سفارش"}
        </h1>
      </div>

      <div className="mt-5 flex items-start px-2">
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173C35] text-white">
            <Check size={14} strokeWidth={2.2} />
          </span>
          <span className="text-[9px] font-medium text-[#173C35]">
            سبد خرید
          </span>
        </div>

        <span
          className={`mt-3 h-px flex-1 ${
            step === 2 ? "bg-[#173C35]" : "bg-[#B8944E]"
          }`}
        />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-medium ${
              step === 1 ? "bg-[#B8944E] text-white" : "bg-[#173C35] text-white"
            }`}
          >
            {step === 2 ? <Check size={14} /> : "۲"}
          </span>

          <span
            className={`text-[9px] font-medium ${
              step === 1 ? "text-[#B8944E]" : "text-[#173C35]"
            }`}
          >
            اطلاعات ارسال
          </span>
        </div>

        <span
          className={`mt-3 h-px flex-1 ${
            step === 2 ? "bg-[#173C35]" : "bg-[#E7E5DF]"
          }`}
        />

        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${
              step === 2
                ? "bg-[#173C35] text-white"
                : "border border-[#E7E5DF] bg-white text-[#8A8A8E]"
            }`}
          >
            ۳
          </span>

          <span
            className={`text-[9px] ${
              step === 2 ? "font-medium text-[#173C35]" : "text-[#8A8A8E]"
            }`}
          >
            ثبت سفارش
          </span>
        </div>
      </div>
    </header>
  );
}
