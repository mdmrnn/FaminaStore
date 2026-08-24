import { Heart } from "lucide-react";

import { useState } from "react";
import type { Product } from "../../data/products";

interface ProductDetailsImageGalleryProps {
  product: Product;
  isFavorite: boolean;
  handleFavorite: () => void;
}
export default function ProductDetailsImageGallery({
  product,
  handleFavorite,
  isFavorite,
}: ProductDetailsImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <section className="w-full">
      <div className="relative aspect-[0.94/1] w-full overflow-hidden rounded-[22px] border border-[#E7E5DF] bg-[#E8EFEA] shadow-[0_4px_18px_rgba(23,60,53,0.04)] sm:rounded-[28px] md:aspect-[0.9/1] lg:aspect-[0.95/1]">
        <img
          src={product.imageGallery[activeImage].src}
          alt={product.imageGallery[activeImage].label}
        />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#E7E5DF] bg-white/75 px-4 py-2 text-[10px] text-[#6D6D6D] sm:text-xs">
          {product.imageGallery[activeImage].label}
        </span>

        <button
          type="button"
          aria-label="افزودن به علاقه‌مندی‌ها"
          onClick={handleFavorite}
          className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8944E] sm:left-5 sm:top-5 sm:h-10 sm:w-10 ${
            isFavorite ? "text-[#B8944E]" : "text-[#173C35]"
          }`}
        >
          <Heart
            size={18}
            strokeWidth={1.6}
            fill={isFavorite ? "#B8944E" : "none"}
          />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2.5 sm:mt-4 sm:gap-3">
        {product.imageGallery.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`نمایش ${item.label}`}
            onClick={() => {
              setActiveImage(index);

              console.log(`نمایش ${item.label}`);
            }}
            className={`relative aspect-square overflow-hidden rounded-xl border bg-[#E8EFEA] transition-all focus:outline-none focus:ring-2 focus:ring-[#B8944E] sm:rounded-2xl ${
              activeImage === index
                ? "border-[#173C35] ring-1 ring-[#173C35]"
                : "border-[#E7E5DF]"
            }`}
          >
            <img
              src={product.imageGallery[index].src}
              alt={product.imageGallery[index].label}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
