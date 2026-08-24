import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import ProductGallery from "./ProductGallery";

export default function Hero() {
  return (
    <section className="w-full px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6 lg:px-8 lg:pb-14 lg:pt-8">
      <div className="mx-auto grid w-full overflow-hidden rounded-[28px] border border-[#E7E5DF] bg-[#E8EFEA] p-4 sm:rounded-[36px] sm:p-6 lg:min-h-130 lg:grid-cols-2 lg:items-center lg:gap-10 lg:p-10">
        <div className="order-1 flex flex-col items-start justify-center px-2 py-5 sm:px-4 lg:order-2 lg:px-6">
          <span className="mb-3 rounded-full bg-white/75 px-4 py-1.5 text-xs font-medium text-[#B8944E] sm:text-sm">
            کالکشن جدید
          </span>
          <h1 className="mb-3 text-3xl font-bold leading-normal tracking-tight text-[#173C35] sm:text-4xl lg:text-5xl">
            ظرافت در هر نگاه
          </h1>

          <p className="mb-6 max-w-md text-sm leading-7 text-[#6D6D6D] sm:text-base sm:leading-8">
            استایلی بهاری، برای درخشیدن شما با فامینا
          </p>
          <Link
            to="/products"
            onClick={() => console.log("مشاهده کالکشن")}
            className="inline-flex items-center gap-2 rounded-full bg-[#173C35] px-5 py-3 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 focus:ring-offset-[#E8EFEA]"
          >
            <span>مشاهده کالکشن</span>
            <ArrowLeft size={17} strokeWidth={1.8} />
          </Link>
        </div>

        <ProductGallery />
      </div>
    </section>
  );
}
