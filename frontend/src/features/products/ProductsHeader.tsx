import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router";

interface SortOption {
  label: string;
  value: "best-selling" | "cheapest" | "popular";
}

const sortOptions: SortOption[] = [
  {
    label: "پرفروش‌ترین",
    value: "best-selling",
  },
  {
    label: "ارزان‌ترین",
    value: "cheapest",
  },
  {
    label: "محبوب‌ترین",
    value: "popular",
  },
];
export default function ProductsHeader() {
  const [activeSort, setActiveSort] =
    useState<SortOption["value"]>("best-selling");

  const navigate = useNavigate();

  const handleSort = (option: SortOption) => {
    setActiveSort(option.value);
    console.log(`مرتب‌سازی: ${option.label}`);
  };
  return (
    <header className="w-full">
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          aria-label="فیلتر محصولات"
          onClick={() => console.log("فیلتر")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E7E5DF] bg-white text-[#173C35] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
        >
          <SlidersHorizontal size={19} strokeWidth={1.7} />
        </button>

        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            strokeWidth={1.7}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D6D6D]"
          />

          <input
            type="search"
            aria-label="جستجو در محصولات"
            placeholder="جستجو در محصولات..."
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                console.log("جستجو در محصولات");
              }
            }}
            className="h-11 w-full rounded-full border border-[#E7E5DF] bg-white py-2 pl-4 pr-11 text-xs text-[#222222] outline-none transition-colors placeholder:text-[#6D6D6D] focus:border-[#173C35] sm:text-sm"
          />
        </div>

        <button
          type="button"
          aria-label="بازگشت"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[#222222] transition-colors hover:bg-[#E8EFEA] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
        >
          <ArrowRight size={21} strokeWidth={1.7} />
        </button>
      </div>

      <div className="mt-3 flex w-full gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sortOptions.map((option) => {
          const isActive = activeSort === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSort(option)}
              className={`shrink-0 rounded-full border px-5 py-2 text-[11px] font-medium transition-all sm:px-6 sm:text-xs ${
                isActive
                  ? "border-[#173C35] bg-[#173C35] text-white"
                  : "border-[#E7E5DF] bg-white text-[#222222] hover:border-[#173C35]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
