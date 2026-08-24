import { Heart, ShoppingBag, Star } from "lucide-react";

import { formatPrice, toPersianDigits } from "../../utils/formatNumber";
import { useNavigate } from "react-router";
import type { Product } from "../../data/products";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { addToCart } from "../../store/cartSlice";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  return (
    <article
      onClick={() => navigate(`/products/${product.id}`)}
      key={product.name}
      className="min-w-0 overflow-hidden rounded-2xl bg-white transition-transform duration-200 hover:-translate-y-0.5 sm:rounded-3xl"
    >
      <div className="relative aspect-[0.94/1] w-full overflow-hidden rounded-2xl border border-[#E7E5DF] bg-[#E8EFEA] sm:rounded-3xl">
        <img
          src={product.imageGallery[0].src}
          alt={product.name}
          className="w-full h-full object-cover"
        />

        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی‌ها"
          onClick={() => console.log(`علاقه‌مندی: ${product.name}`)}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-[#222222] transition-colors hover:bg-[#173C35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B8944E] sm:right-3 sm:top-3 sm:h-8 sm:w-8"
        >
          <Heart size={16} strokeWidth={1.5} />
        </button>
      </div>

      <div className="px-1.5 pb-2 pt-2 sm:px-2 sm:pb-3 sm:pt-3">
        <h2 className="truncate text-[11px] font-medium leading-5 text-[#222222] sm:text-sm">
          {product.name}
        </h2>

        <p className="mt-0.5 text-[9px] font-medium text-[#222222] sm:mt-1 sm:text-xs">
          {formatPrice(product.price)}
        </p>

        <div className="mt-2 flex items-center justify-between sm:mt-3">
          <button
            type="button"
            aria-label="افزودن به سبد خرید"
            onClick={() => {
              dispatch(addToCart(product));
              console.log(`افزودن به سبد: ${product.name}`);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#173C35] transition-colors hover:bg-[#173C35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B8944E] sm:h-8 sm:w-8"
          >
            <ShoppingBag size={14} strokeWidth={1.6} />
          </button>

          <div className="flex items-center gap-1 text-[10px] text-[#6D6D6D] sm:text-xs">
            <Star
              size={13}
              fill="#B8944E"
              strokeWidth={1.2}
              className="text-[#B8944E]"
            />
            <span>{toPersianDigits(product.rating)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
