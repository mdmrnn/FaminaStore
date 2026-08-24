import {
  ArrowUp,
  BadgeCheck,
  Clock3,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Truck,
} from "lucide-react";

import BrandLogo from "../../features/header/BrandLogo";
import FooterLink from "../../features/footer/FooterLink";
import InstagramIcon from "../../assets/icons/components/InstagramIcon";
import FooterNavBar from "../../features/footer/FooterNavBar";

const aboutLinks = [
  "درباره فامینااسکرف",
  "چرا فامینااسکرف؟",
  "همکاری با ما",
  "فروشگاه حضوری",
  "مجله فامینااسکرف",
];

const quickLinks = [
  "خانه",
  "دسته‌بندی محصولات",
  "جدیدها",
  "پرفروش‌ترین‌ها",
  "تماس با ما",
];

const shoppingLinks = [
  "نحوه ثبت سفارش",
  "روش‌های پرداخت",
  "ارسال و تحویل",
  "بازگشت کالا",
  "سوالات متداول",
];

const valuePropositions = [
  {
    icon: Truck,
    title: "ارسال سریع",
    description: "۲ تا ۳ روز کاری",
  },
  {
    icon: ShieldCheck,
    title: "پرداخت امن",
    description: "درگاه بانکی معتبر",
  },
  {
    icon: BadgeCheck,
    title: "ضمانت بازگشت کالا",
    description: "تا ۷ روز",
  },
  {
    icon: Clock3,
    title: "پشتیبانی ۲۴/۷",
    description: "پاسخگوی شما هستیم",
  },
];

export default function Footer() {
  const handleNewsletter = () => {
    console.log("عضویت در خبرنامه");
  };

  const handleBackToTop = () => {
    console.log("بازگشت به بالای صفحه");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      <footer className="hidden w-full md:block">
        <section className="border-y border-[#E7E5DF] bg-white px-6 py-7 lg:px-10 xl:px-14">
          <div className="grid w-full grid-cols-4 gap-6 lg:grid-cols-4">
            {valuePropositions.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-center justify-center gap-3 border-l border-[#E7E5DF] last:border-l-0"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8EFEA] text-[#173C35]">
                  <Icon size={21} strokeWidth={1.7} />
                </span>

                <div className="text-right">
                  <h3 className="text-sm font-semibold text-[#173C35]">
                    {title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6D6D6D]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full bg-[#173C35] px-6 py-12 text-white lg:px-10 xl:px-14">
          <div className="grid w-full gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:pl-6">
              <BrandLogo footer />

              <p className="mt-5 max-w-xs text-sm leading-7 text-white/70">
                فامینااسکرف؛ انتخابی برای استایل خاص و تخفیفی که همیشه همراه
                شماست.
              </p>

              <div className="mt-6 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="اینستاگرام"
                  onClick={() => console.log("اینستاگرام فامینااسکرف")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#B8944E] hover:bg-[#B8944E] hover:text-[#173C35]"
                >
                  <InstagramIcon />
                </button>

                <button
                  type="button"
                  aria-label="تلگرام"
                  onClick={() => console.log("تلگرام فامینااسکرف")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#B8944E] hover:bg-[#B8944E] hover:text-[#173C35]"
                >
                  <Send size={17} strokeWidth={1.7} />
                </button>

                <button
                  type="button"
                  aria-label="واتساپ"
                  onClick={() => console.log("واتساپ فامینااسکرف")}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#B8944E] hover:bg-[#B8944E] hover:text-[#173C35]"
                >
                  <MessageCircle size={17} strokeWidth={1.7} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-white">درباره ما</h3>
              <div className="flex flex-col gap-3">
                {aboutLinks.map((label) => (
                  <FooterLink
                    key={label}
                    label={label}
                    onClick={() => console.log(`لینک فوتر: ${label}`)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-white">دسترسی سریع</h3>
              <div className="flex flex-col gap-3">
                {quickLinks.map((label) => (
                  <FooterLink
                    key={label}
                    label={label}
                    onClick={() => console.log(`لینک فوتر: ${label}`)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold text-white">
                راهنمای خرید
              </h3>
              <div className="flex flex-col gap-3">
                {shoppingLinks.map((label) => (
                  <FooterLink
                    key={label}
                    label={label}
                    onClick={() => console.log(`لینک فوتر: ${label}`)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">عضویت در خبرنامه</h3>

              <p className="mt-3 text-sm leading-6 text-white/70">
                برای اطلاع از جدیدترین کالکشن‌ها و تخفیف‌ها
              </p>

              <div className="mt-5 flex h-11 overflow-hidden rounded-full border border-white/15 bg-white/5">
                <input
                  type="text"
                  aria-label="ایمیل یا شماره تلفن"
                  placeholder="ایمیل یا شماره تلفن"
                  className="min-w-0 flex-1 bg-transparent px-4 text-xs text-white outline-none placeholder:text-white/40"
                />

                <button
                  type="button"
                  onClick={handleNewsletter}
                  className="shrink-0 bg-[#B8944E] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#a78443]"
                >
                  عضویت
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                <Mail size={14} strokeWidth={1.6} />
                <span>اطلاعات شما نزد ما محفوظ است.</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-xs text-white/50">
              کلیه حقوق این وب‌سایت متعلق به فامینااسکرف می‌باشد.
            </p>

            <button
              type="button"
              aria-label="بازگشت به بالای صفحه"
              onClick={handleBackToTop}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-[#B8944E] hover:bg-[#B8944E] hover:text-[#173C35]"
            >
              <ArrowUp size={18} strokeWidth={1.7} />
            </button>
          </div>
        </section>
      </footer>
      <FooterNavBar />
    </>
  );
}
