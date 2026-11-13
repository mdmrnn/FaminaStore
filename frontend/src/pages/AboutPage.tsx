import { ArrowLeft, BadgeCheck, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    icon: Sparkles,
    title: "انتخاب با دقت",
    description:
      "هر محصول با اطلاعاتی روشن دربارهٔ جنس، قیمت و تصاویرش معرفی می‌شود تا انتخاب برایتان ساده‌تر باشد.",
  },
  {
    icon: BadgeCheck,
    title: "خرید با اطمینان",
    description:
      "جزئیات سفارش و روش ارسال را پیش از ثبت می‌بینید و مبلغ نهایی در سرور محاسبه می‌شود.",
  },
  {
    icon: Heart,
    title: "سلیقهٔ خودتان",
    description:
      "از بافت‌های لطیف تا طرح‌های چشم‌گیر، فامینا برای پیدا کردن انتخابی هماهنگ با استایل شماست.",
  },
];

export default function AboutPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <section className="relative overflow-hidden rounded-4xl bg-[#173C35] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16 lg:py-20">
          <div className="absolute -left-12 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="absolute -left-4 -top-8 h-40 w-40 rounded-full border border-[#B8944E]/40" />
          <div className="relative max-w-2xl">
            <p className="mb-3 text-xs font-medium tracking-wide text-[#D7C293] sm:text-sm">
              دربارهٔ فامینا
            </p>
            <h1 className="text-2xl font-bold leading-relaxed sm:text-3xl lg:text-4xl">
              انتخابی آرام برای استایلی که از آنِ شماست
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-8 text-white/75 sm:text-base">
              فامینا فروشگاهی برای دوست‌داران روسری و شال است؛ جایی برای دیدن
              بافت‌ها و طرح‌های گوناگون و پیدا کردن محصولی که با رنگ‌ها و
              حال‌وهوای روزمرهٔ شما جور باشد.
            </p>
            <Link
              to="/products"
              className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-[#B8944E] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#a58240] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#173C35]"
            >
              دیدن محصولات
              <ArrowLeft size={17} />
            </Link>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
            <p className="text-xs font-medium text-[#B8944E]">نگاه ما</p>
            <h2 className="mt-2 text-xl font-bold text-[#173C35] sm:text-2xl">
              خرید خوب از انتخابی روشن شروع می‌شود
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#71717A]">
              می‌خواهیم مسیر دیدن محصول تا ثبت سفارش، ساده و قابل‌فهم باشد.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-3xl border border-[#E7E5DF] bg-white p-5 sm:p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEA] text-[#173C35]">
                  <Icon size={21} strokeWidth={1.7} />
                </span>
                <h3 className="mt-4 text-sm font-bold text-[#173C35]">
                  {title}
                </h3>
                <p className="mt-2 text-xs leading-7 text-[#71717A]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#E7E5DF] bg-[#E8EFEA]/70 p-5 sm:flex-row sm:items-center sm:p-7">
          <div>
            <h2 className="text-base font-bold text-[#173C35]">
              برای انتخاب محصول راهنمایی می‌خواهید؟
            </h2>
            <p className="mt-1 text-xs leading-6 text-[#71717A]">
              پیام‌تان را در صفحهٔ تماس برای ما آماده کنید.
            </p>
          </div>
          <Link
            to="/contactus"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#173C35]/20 bg-white px-4 text-xs font-semibold text-[#173C35] transition-colors hover:border-[#173C35] focus:outline-none focus:ring-2 focus:ring-[#B8944E]"
          >
            تماس با فامینا
            <ArrowLeft size={15} />
          </Link>
        </section>
      </div>
    </main>
  );
}
