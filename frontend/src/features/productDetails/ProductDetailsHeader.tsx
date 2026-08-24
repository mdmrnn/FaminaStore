import { ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router";

interface ProductDetailsHeaderProps {
  isFavorite: boolean;
  handleFavorite: () => void;
}
export default function ProductDetailsHeader({
  isFavorite,
  handleFavorite,
}: ProductDetailsHeaderProps) {
  const navigate = useNavigate();
  return (
    <div className="mb-4 flex w-full items-center justify-between sm:mb-6">
      <button
        type="button"
        aria-label="بازگشت"
        onClick={() => navigate(-1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
      >
        <ArrowRight size={20} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        aria-label={
          isFavorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"
        }
        onClick={handleFavorite}
        className={`flex h-10 w-10 items-center justify-center rounded-full border bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8944E] ${
          isFavorite
            ? "border-[#B8944E] text-[#B8944E]"
            : "border-[#E7E5DF] text-[#222222]"
        }`}
      >
        <Heart
          size={19}
          strokeWidth={1.6}
          fill={isFavorite ? "#B8944E" : "none"}
        />
      </button>
    </div>
  );
}
