import { Heart, Home, LayoutGrid, ShoppingBag, User } from "lucide-react";
import { useSelector } from "react-redux";

import type { RootState } from "../../store/store";
import { useState } from "react";
import { NavLink } from "react-router";
import { toPersianDigits } from "../../utils/formatNumber";

const bottomNavItems = [
  { label: "خانه", key: "home", icon: Home, link: "/" },
  {
    label: "دسته‌بندی‌ها",
    key: "categories",
    icon: LayoutGrid,
    link: "/products",
  },
  { label: "علاقه‌مندی‌ها", key: "wishlist", icon: Heart, link: "/" },
  { label: "سبد خرید", key: "cart", icon: ShoppingBag, link: "/cart" },
  { label: "پروفایل", key: "profile", icon: User, link: "/profile" },
];

export default function FooterNavBar() {
  const [activeBottomTab, setActiveBottomTab] = useState("home");

  const items = useSelector((state: RootState) => state.cart.items);
  const cartTotalItems = items.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const handleBottomNavigation = (key: string, label: string) => {
    setActiveBottomTab(key);
    console.log(`ناوبری پایین: ${label}`);
  };
  return (
    <nav
      aria-label="ناوبری موبایل"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E7E5DF] bg-white/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-4px_20px_rgba(23,60,53,0.06)] backdrop-blur-md md:hidden"
    >
      <div className="grid grid-cols-5">
        {bottomNavItems.map(({ label, key, icon: Icon, link }) => {
          const isActive = activeBottomTab === key;

          return (
            <NavLink
              to={link}
              key={key}
              aria-label={label}
              onClick={() => handleBottomNavigation(key, label)}
              className={`relative flex min-w-0 flex-col items-center gap-1 py-1.5 text-[10px] transition-colors ${
                isActive ? "font-medium text-[#173C35]" : "text-[#6D6D6D]"
              }`}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={isActive ? 2 : 1.7} />

                {key === "cart" && (
                  <span className="absolute -right-2 -top-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[#B8944E] px-0.5 text-[8px] font-bold text-white">
                    {toPersianDigits(cartTotalItems)}
                  </span>
                )}
              </span>

              <span className="truncate">{label}</span>

              {isActive && (
                <span className="absolute bottom-0 h-1 w-1 rounded-full bg-[#B8944E]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
