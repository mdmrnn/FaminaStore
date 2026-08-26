import { ArrowLeft } from "lucide-react";
import { categories } from "../../data-test/categories.ts";
import { Link } from "react-router";

export default function Catogories() {
  return (
    <section className="w-full px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex items-center justify-between sm:mb-6">
        <h2 className="text-lg font-bold text-[#173C35] sm:text-xl lg:text-2xl">
          دسته‌بندی محصولات
        </h2>

        <Link
          to="/products"
          onClick={() => console.log("مشاهده همه دسته‌بندی‌ها")}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#6D6D6D] transition-colors hover:text-[#173C35] sm:text-sm cursor-pointer"
        >
          <span className="">مشاهده همه</span>
          <ArrowLeft size={15} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="grid w-full grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
        {categories.map(({ name, icon: Icon }) => (
          <Link
            to="/products"
            key={name}
            onClick={() => console.log(`دسته‌بندی: ${name}`)}
            className="group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl border border-[#E7E5DF] bg-[#E8EFEA]/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 sm:gap-3 sm:rounded-3xl sm:p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#173C35] sm:h-14 sm:w-14">
              <Icon size={21} strokeWidth={1.6} />
            </span>

            <span className="truncate text-xs font-medium text-[#222222] sm:text-sm">
              {name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
