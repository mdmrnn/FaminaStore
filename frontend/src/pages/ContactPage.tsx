import { useState, type FormEvent } from "react";
import { ArrowLeft, Mail, MessageCircle, PackageCheck } from "lucide-react";
import { Link } from "react-router-dom";

const supportEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() ?? "";
const supportPhone = import.meta.env.VITE_CONTACT_PHONE?.trim() ?? "";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [replyAddress, setReplyAddress] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const subject = "پیام از صفحهٔ تماس فامینا";
    const body = `نام: ${name}\nراه پاسخ‌گویی: ${replyAddress}\n\nپیام:\n${message}`;

    if (supportEmail) {
      window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setNotice("برنامهٔ ایمیل باز شد؛ پیام را برای ارسال نهایی بررسی کنید.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`);
      setNotice(
        "متن پیام کپی شد. ایمیل پشتیبانی هنوز برای سایت تنظیم نشده است؛ پس از دریافت راه ارتباطی رسمی می‌توانیم ارسال مستقیم را فعال کنیم.",
      );
    } catch {
      setNotice(
        "ایمیل پشتیبانی هنوز برای سایت تنظیم نشده است. برای فعال‌کردن ارسال مستقیم، راه ارتباطی رسمی فروشگاه باید ثبت شود.",
      );
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <header className="mb-7 max-w-2xl sm:mb-9">
          <p className="text-xs font-medium text-[#B8944E]">همراه شما هستیم</p>
          <h1 className="mt-2 text-2xl font-bold text-[#173C35] sm:text-3xl">
            تماس با فامینا
          </h1>
          <p className="mt-3 text-sm leading-8 text-[#71717A]">
            دربارهٔ انتخاب محصول یا سفارش‌تان پرسشی دارید؟ پیام‌تان را بنویسید.
            اگر برای پیگیری سفارش پیام می‌دهید، شناسهٔ سفارش را هم در متن قرار
            دهید.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:gap-8">
          <section className="rounded-3xl border border-[#E7E5DF] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEA] text-[#173C35]">
                <MessageCircle size={21} strokeWidth={1.7} />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#173C35]">پیام شما</h2>
                <p className="mt-1 text-xs text-[#8A8A8E]">
                  راه پاسخ‌گویی را در فرم وارد کنید.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
                  نام
                </span>
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  className="h-12 w-full rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 text-sm outline-none transition-colors focus:border-[#173C35]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
                  شماره یا ایمیل برای پاسخ
                </span>
                <input
                  required
                  value={replyAddress}
                  onChange={(event) => setReplyAddress(event.target.value)}
                  autoComplete="email"
                  className="h-12 w-full rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 text-sm outline-none transition-colors focus:border-[#173C35]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-[#71717A]">
                  متن پیام
                </span>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full resize-y rounded-2xl border border-[#E7E5DF] bg-[#FAF9F5] px-4 py-3 text-sm leading-7 outline-none transition-colors focus:border-[#173C35]"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#173C35] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#122f2a] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2"
              >
                {supportEmail ? (
                  <>
                    آماده‌سازی ایمیل <Mail size={17} />
                  </>
                ) : (
                  <>
                    کپی متن پیام <ArrowLeft size={17} />
                  </>
                )}
              </button>
              {notice && (
                <p role="status" className="text-xs leading-6 text-[#173C35]">
                  {notice}
                </p>
              )}
            </form>
          </section>

          <aside className="space-y-3">
            <div className="rounded-3xl bg-[#173C35] p-5 text-white sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#D7C293]">
                <PackageCheck size={21} strokeWidth={1.7} />
              </span>
              <h2 className="mt-4 text-base font-bold">پیگیری سفارش</h2>
              <p className="mt-2 text-xs leading-7 text-white/75">
                برای اینکه سریع‌تر راهنمایی شوید، شناسهٔ سفارش و شماره‌ای را که
                هنگام ثبت وارد کرده‌اید در پیام‌تان بنویسید.
              </p>
            </div>

            <div className="rounded-3xl border border-[#E7E5DF] bg-white p-5 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEA] text-[#173C35]">
                <Mail size={21} strokeWidth={1.7} />
              </span>
              <h2 className="mt-4 text-sm font-bold text-[#173C35]">
                راه ارتباطی رسمی
              </h2>
              <p className="mt-2 text-xs leading-7 text-[#71717A]">
                {supportEmail
                  ? supportEmail
                  : "ایمیل پشتیبانی هنوز در تنظیمات سایت ثبت نشده است. تا آن زمان می‌توانید متن پیام را کپی کنید."}
              </p>
            </div>

            <div className="rounded-3xl border border-[#E7E5DF] bg-white p-5 sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8EFEA] text-[#173C35]">
                <MessageCircle size={21} strokeWidth={1.7} />
              </span>
              <h2 className="mt-4 text-sm font-bold text-[#173C35]">
                راه‌های ارتباطی
              </h2>
              <dl className="mt-3 space-y-2 text-xs leading-6 text-[#71717A]">
                <div className="flex justify-between gap-3">
                  <dt>شماره تماس</dt>
                  <dd>{supportPhone || "شماره تماس (جایگزین شود)"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>ایمیل</dt>
                  <dd>{supportEmail || "ایمیل پشتیبانی (جایگزین شود)"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>اینستاگرام</dt>
                  <dd dir="ltr">@faminagallery</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>تلگرام</dt>
                  <dd dir="ltr">@faminagallery</dd>
                </div>
              </dl>
            </div>

            <Link
              to="/products"
              className="flex items-center justify-between rounded-3xl border border-[#E7E5DF] bg-[#E8EFEA]/70 p-5 text-sm font-semibold text-[#173C35] transition-colors hover:bg-white"
            >
              بازگشت به فروشگاه
              <ArrowLeft size={17} />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
