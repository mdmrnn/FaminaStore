import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyCart() {
  return (
    <section className="flex min-h-[55vh] flex-col items-center justify-center rounded-3xl border border-[#E7E5DF] bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8EFEA] text-[#173C35]">
        <ShoppingBag size={34} strokeWidth={1.4} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-[#173C35]">
        سبد خرید شما خالی است
      </h2>

      <p className="mt-2 max-w-xs text-xs leading-6 text-[#71717A]">
        هنوز محصولی به سبد خرید خود اضافه نکرده‌اید. محصولات مورد علاقه‌تان را
        پیدا کنید و به سبد اضافه کنید.
      </p>

      <Link
        to="/products"
        onClick={() => console.log("مشاهده محصولات")}
        className="mt-6 flex h-11 items-center justify-center rounded-2xl bg-[#173C35] px-8 text-sm font-medium text-white transition-colors hover:bg-[#122f2a] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2"
      >
        مشاهده محصولات
      </Link>
    </section>
  );
}
