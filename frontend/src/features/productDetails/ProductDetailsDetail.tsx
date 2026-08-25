import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
} from "../../store/cartSlice";
import { formatPrice, toPersianDigits } from "../../utils/formatNumber";

import type { RootState, AppDispatch } from "../../store/store";
import type { Product } from "../../types/product";

interface ProductDetailsDetailProps {
  product: Product;
  isFavorite: boolean;
  handleFavorite: () => void;
}
export default function ProductDetailsDetail({
  product,
  isFavorite,
  handleFavorite,
}: ProductDetailsDetailProps) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const cartItem = cartItems.find((item) => item.product.id === product.id);
  let quantity = 1;
  if (cartItem) quantity = cartItem.quantity;

  return (
    <section className="w-full rounded-[22px] border border-[#E7E5DF] bg-white p-4 sm:rounded-[28px] sm:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span className="mb-2 inline-block text-[10px] font-medium text-[#B8944E] sm:text-xs">
            فامینااسکرف
          </span>

          <h1 className="text-xl font-bold leading-8 text-[#173C35] sm:text-2xl lg:text-3xl">
            {product.name}
          </h1>
        </div>

        <button
          type="button"
          aria-label={
            isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
          }
          onClick={handleFavorite}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8944E] ${
            isFavorite
              ? "border-[#B8944E] bg-[#B8944E]/10 text-[#B8944E]"
              : "border-[#E7E5DF] text-[#173C35] hover:bg-[#E8EFEA]"
          }`}
        >
          <Heart
            size={18}
            strokeWidth={1.6}
            fill={isFavorite ? "#B8944E" : "none"}
          />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-[#E8EFEA] px-3 py-1.5 text-xs text-[#173C35]">
          <Star
            size={14}
            fill="#B8944E"
            strokeWidth={1.2}
            className="text-[#B8944E]"
          />
          <span>{toPersianDigits(product.rating)}</span>
        </div>

        <span className="text-xs text-[#6D6D6D]">
          {toPersianDigits(product.reviewCount)}
        </span>
      </div>

      <div className="my-6 h-px w-full bg-[#E7E5DF]" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <span className="mb-1 block text-xs text-[#6D6D6D]">قیمت محصول</span>

          <p className="text-xl font-bold text-[#173C35] sm:text-2xl">
            {formatPrice(product.price)}
          </p>
        </div>

        <span className="rounded-full bg-[#E8EFEA] px-3 py-1.5 text-[10px] font-medium text-[#173C35] sm:text-xs">
          {product.availability ? "موجود" : "ناموجود"}
        </span>
      </div>

      <div className="mt-6 rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6D6D6D]">جنس محصول</span>

          <span className="text-sm font-medium text-[#222222]">
            {product.material}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-sm font-medium text-[#222222]">تعداد</span>

        <div className="flex h-10 items-center overflow-hidden rounded-full border border-[#E7E5DF] bg-white">
          <button
            type="button"
            aria-label="افزایش تعداد"
            onClick={() => {
              dispatch(increaseQuantity(product.id));

              console.log(`افزایش تعداد: ${product.name}`);
            }}
            className="flex h-10 w-10 items-center justify-center text-[#173C35] transition-colors hover:bg-[#E8EFEA]"
          >
            <Plus size={15} strokeWidth={1.8} />
          </button>

          <span className="flex min-w-8 justify-center text-sm font-medium">
            {quantity.toLocaleString("fa-IR")}
          </span>

          <button
            type="button"
            aria-label="کاهش تعداد"
            onClick={() => {
              dispatch(decreaseQuantity(product.id));
              console.log(`کاهش تعداد: ${product.name}`);
            }}
            className="flex h-10 w-10 items-center justify-center text-[#173C35] transition-colors hover:bg-[#E8EFEA]"
          >
            <Minus size={15} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          dispatch(addToCart(product));
          navigate("/cart");
          console.log(`افزودن به سبد: ${product.name} - تعداد: ${quantity},`);
        }}
        className="mt-6 h-12 w-full items-center justify-center gap-2 rounded-full bg-[#173C35] text-sm font-medium text-white transition-all hover:bg-[#1f4c43] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 flex"
      >
        <ShoppingBag size={18} strokeWidth={1.7} />
        <span>افزودن به سبد خرید</span>
      </button>
    </section>
  );
}
