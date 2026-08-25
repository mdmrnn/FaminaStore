import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";

import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  type CartItem,
} from "../../store/cartSlice";
import { toPersianDigits, formatPrice } from "../../utils/formatNumber";

interface CartCardProp {
  item: CartItem;
}

export default function CartCard({ item }: CartCardProp) {
  console.log("CartItem in CartCard:", JSON.stringify(item, null, 2));

  const dispatch = useDispatch();

  {
    const imageSrc = item.product.imageGallery[0]?.src;

    return (
      <article className="rounded-2xl border border-[#E7E5DF] bg-white p-3 shadow-sm sm:p-4">
        <div className="flex gap-3">
          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl border border-[#E7E5DF] bg-[#E8EFEA] sm:h-32 sm:w-28">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={item.product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-linear-to-br from-[#E8EFEA] via-[#FAF9F5] to-[#E8EFEA]" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[8px] text-[#6D6D6D]">
                  <img
                    src="../../assets/logo/logo-B8944E.svg"
                    alt="logo famina"
                    className="h-full w-full object-cover"
                  />
                </span>
              </>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <h2 className="line-clamp-2 text-sm font-medium leading-6 text-[#222222]">
                {item.product.name}
              </h2>

              <button
                type="button"
                aria-label={`حذف ${item.product.name}`}
                onClick={() => dispatch(removeFromCart(item.product.id))}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#8A8A8E] transition-colors hover:bg-red-50 hover:text-[#D9534F] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
              >
                <Trash2 size={16} strokeWidth={1.6} />
              </button>
            </div>

            <span className="mt-1 text-[10px] text-[#71717A]">
              جنس: {item.product.material}
            </span>

            <div className="mt-auto pt-2">
              <span className="text-sm font-bold text-[#173C35]">
                {formatPrice(item.product.price)} تومان
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#E7E5DF] pt-3">
          <span className="text-[10px] text-[#71717A]">تعداد</span>

          <div className="flex h-9 items-center overflow-hidden rounded-full border border-[#E7E5DF] bg-[#FAF9F5]">
            <button
              type="button"
              aria-label={`افزایش تعداد ${item.product.name}`}
              onClick={() => dispatch(increaseQuantity(item.product.id))}
              className="flex h-9 w-9 items-center justify-center text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-1 focus:ring-[#B8944E]"
            >
              <Plus size={14} strokeWidth={1.8} />
            </button>

            <span className="flex min-w-8 justify-center text-xs font-medium text-[#222222]">
              {toPersianDigits(item.quantity)}
            </span>

            <button
              type="button"
              aria-label={`کاهش تعداد ${item.product.name}`}
              onClick={() => dispatch(decreaseQuantity(item.product.id))}
              className="flex h-9 w-9 items-center justify-center text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-1 focus:ring-[#B8944E]"
            >
              <Minus size={14} strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </article>
    );
  }
}
