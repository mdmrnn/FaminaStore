import { ArrowLeft, Heart, ShoppingBag, Star } from "lucide-react";
import { products } from "../../data/products.ts";
import { toPersianDigits, formatPrice } from "../../utils/formatNumber.tsx";
import { Link, useNavigate } from "react-router";

export default function SpecialOffers() {
  const navigate = useNavigate();
  return (
    <section className="w-full px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8 lg:pb-16 lg:pt-10">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <h2 className="text-lg font-bold text-[#173C35] sm:text-xl lg:text-2xl">
          پیشنهاد ویژه
        </h2>

        <Link
          to="/products"
          type="button"
          onClick={() => console.log("مشاهده همه پیشنهادها")}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#6D6D6D] transition-colors hover:text-[#173C35] sm:text-sm"
        >
          <span>مشاهده همه</span>
          <ArrowLeft size={15} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <article
            onClick={() => navigate(`/products/${product.id}`)}
            key={product.name}
            className="group min-w-0 overflow-hidden rounded-2xl border border-[#E7E5DF] bg-white shadow-[0_4px_18px_rgba(23,60,53,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_rgba(23,60,53,0.08)] sm:rounded-3xl"
          >
            <div className="relative aspect-4/5 overflow-hidden bg-[#E8EFEA]">
              <img
                src={product.imageGallery[0].src}
                alt={product.name}
                className="w-full h-full object-cover"
              />

              <button
                type="button"
                aria-label="افزودن به علاقه‌مندی‌ها"
                onClick={(event) => {
                  event.stopPropagation();
                  console.log(`افزودن به علاقه‌مندی‌ها: ${product.name}`);
                }}
                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#173C35] shadow-sm transition-colors hover:bg-[#173C35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#B8944E] sm:right-3 sm:top-3 sm:h-9 sm:w-9"
              >
                <Heart size={16} strokeWidth={1.7} />
              </button>
            </div>

            <div className="p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="min-h-10 flex-1 text-xs font-medium leading-5 text-[#222222] sm:min-h-0 sm:text-sm sm:leading-6">
                  {product.name}
                </h3>

                <button
                  type="button"
                  aria-label="افزودن به سبد خرید"
                  onClick={(event) => {
                    event.stopPropagation();
                    console.log(`افزودن به سبد خرید: ${product.name}`);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#173C35] text-white transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 sm:h-9 sm:w-9"
                >
                  <ShoppingBag size={15} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6D6D6D] sm:text-xs">
                <Star
                  size={13}
                  fill="#B8944E"
                  strokeWidth={1.2}
                  className="text-[#B8944E]"
                />
                <span>{toPersianDigits(product.rating)}</span>
              </div>

              <p className="mt-2 text-xs font-semibold text-[#173C35] sm:text-sm">
                {`${formatPrice(product.price)} تومان`}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
