import { formatPrice } from "../../utils/formatNumber";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../../data/constants";

interface CartAbstractCardProps {
  subtotal: number;
  appliedDiscount: number;
}

export default function CartAbstractCard({
  subtotal,
  appliedDiscount,
}: CartAbstractCardProps) {
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const totalPayable = Math.max(0, subtotal + shippingFee - appliedDiscount);

  return (
    <section
      aria-label="خلاصه سفارش"
      className="mt-5 rounded-2xl border border-[#E7E5DF] bg-white p-4 shadow-sm"
    >
      <h2 className="mb-4 text-sm font-bold text-[#173C35]">خلاصه سفارش</h2>

      <div className="space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#71717A]">جمع محصولات</span>

          <span className="font-medium text-[#222222]">
            {formatPrice(subtotal)} تومان
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[#71717A]">هزینه ارسال</span>

          <span
            className={`font-medium ${
              shippingFee === 0 ? "text-[#173C35]" : "text-[#222222]"
            }`}
          >
            {shippingFee === 0 ? "رایگان" : `${formatPrice(shippingFee)} تومان`}
          </span>
        </div>

        {appliedDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[#71717A]">تخفیف</span>

            <span className="font-medium text-[#D9534F]">
              - {formatPrice(appliedDiscount)} تومان
            </span>
          </div>
        )}

        <div className="my-2 border-t border-dashed border-[#E7E5DF]" />

        <div className="flex items-end justify-between gap-4">
          <span className="font-bold text-[#173C35]">مبلغ قابل پرداخت</span>

          <span className="text-lg font-bold text-[#173C35]">
            {formatPrice(totalPayable)} تومان
          </span>
        </div>
      </div>
    </section>
  );
}
