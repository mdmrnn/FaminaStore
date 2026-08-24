import {
  Heart,
  Menu,
  PanelsTopLeft,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

import { useState } from "react";
import { toPersianDigits } from "../../utils/formatNumber";
import type { RootState } from "../../store/store";

import BrandLogo from "../../features/header/BrandLogo";
import IconButton from "../../features/header/IconButton";
import { Link, NavLink } from "react-router";

interface NavItem {
  label: string;
  key: string;
  link: string;
}

const navItems: NavItem[] = [
  { label: "خانه", key: "home", link: "/" },
  { label: "فروشگاه", key: "store", link: "/products" },
  { label: "تماس با ما", key: "contact", link: "/contactus" },
  { label: "درباره ما", key: "about", link: "/aboutus" },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const items = useSelector((state: RootState) => state.cart.items);
  const cartTotalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const handleNavigation = (label: string) => {
    console.log(`ناوبری: ${label}`);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full">
      <div className="hidden h-9 items-center justify-center bg-[#173C35] px-4 text-xs font-medium text-white sm:flex">
        ارسال رایگان برای سفارش‌های بالای ۱,۵۰۰,۰۰۰ تومان
      </div>

      <div className="sticky top-0 z-40 w-full border-b border-[#E7E5DF] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 md:hidden">
          <div className="flex items-center gap-1">
            <IconButton
              label="باز کردن منو"
              onClick={() => {
                setIsMobileMenuOpen((previous) => !previous);
                console.log("باز و بسته کردن منوی موبایل");
              }}
            >
              {isMobileMenuOpen ? (
                <X size={21} strokeWidth={1.8} />
              ) : (
                <Menu size={21} strokeWidth={1.8} />
              )}
            </IconButton>

            <IconButton
              label="جستجو"
              onClick={() => console.log("باز کردن جستجو")}
            >
              <Search size={20} strokeWidth={1.8} />
            </IconButton>
          </div>

          <Link to="/">
            <BrandLogo />
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/profile">
              <IconButton
                label="پروفایل کاربری"
                onClick={() => console.log("باز کردن پروفایل کاربری")}
              >
                <User size={20} strokeWidth={1.8} />
              </IconButton>
            </Link>
            <Link to="/cart">
              <IconButton
                label="سبد خرید"
                badge={toPersianDigits(cartTotalItems)}
                onClick={() => console.log("باز کردن سبد خرید")}
              >
                <ShoppingBag size={20} strokeWidth={1.8} />
              </IconButton>
            </Link>
          </div>
        </div>

        <div className="hidden w-full md:block">
          <div className="flex h-19.5 w-full items-center justify-between gap-8 px-6 lg:px-10 xl:px-14">
            <div className="flex flex-1 items-center">
              <div className="relative w-full max-w-sm">
                <Search
                  size={18}
                  strokeWidth={1.7}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6D6D6D]"
                />
                <input
                  type="search"
                  placeholder="جستجو در محصولات..."
                  aria-label="جستجو در محصولات"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      console.log("جستجو در محصولات");
                    }
                  }}
                  className="h-11 w-full rounded-full border border-[#E7E5DF] bg-[#FAF9F5] py-2 pl-4 pr-11 text-sm text-[#222222] outline-none transition-colors placeholder:text-[#9A9A9A] focus:border-[#173C35]"
                />
              </div>
            </div>

            <Link to="/" className="shrink-0">
              <BrandLogo />
            </Link>

            <div className="flex flex-1 items-center justify-end gap-1">
              <Link to="/profile">
                <IconButton
                  label="پروفایل کاربری"
                  onClick={() => console.log("باز کردن پروفایل کاربری")}
                >
                  <User size={21} strokeWidth={1.7} />
                </IconButton>
              </Link>

              <IconButton
                label="علاقه‌مندی‌ها"
                onClick={() => console.log("باز کردن علاقه‌مندی‌ها")}
              >
                <Heart size={21} strokeWidth={1.7} />
              </IconButton>

              <Link to="/cart">
                <IconButton
                  label="سبد خرید"
                  badge={toPersianDigits(cartTotalItems)}
                  onClick={() => console.log("باز کردن سبد خرید")}
                >
                  <ShoppingBag size={21} strokeWidth={1.7} />
                </IconButton>
              </Link>
            </div>
          </div>

          <nav
            aria-label="ناوبری اصلی"
            className="flex h-12 items-center justify-center border-t border-[#E7E5DF]/70"
          >
            <div className="flex h-full items-center gap-7 px-6">
              {navItems.map((item) => (
                <NavLink
                  to={item.link}
                  key={item.key}
                  end={item.link === "/"}
                  onClick={() => handleNavigation(item.label)}
                  className={({ isActive }) =>
                    `group relative flex h-full cursor-pointer items-center text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#173C35]"
                        : "text-[#6D6D6D] hover:text-[#173C35]"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}

                      <span
                        className={`absolute bottom-0 right-0 h-0.5 bg-[#B8944E] transition-all duration-200 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-[#E7E5DF] bg-white px-4 py-4 md:hidden">
            <nav
              aria-label="منوی موبایل"
              className="flex flex-col divide-y divide-[#E7E5DF]"
            >
              {navItems.map((item) => (
                <NavLink
                  to={item.link}
                  key={item.key}
                  onClick={() => handleNavigation(item.label)}
                  className="flex items-center justify-between py-3 text-right text-sm font-medium text-[#173C35]"
                >
                  <span>{item.label}</span>
                  <PanelsTopLeft
                    size={16}
                    strokeWidth={1.6}
                    className="text-[#B8944E]"
                  />
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
