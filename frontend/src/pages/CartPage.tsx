import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../store/store";
import { clearCart } from "../store/cartSlice";
import CartHeader from "../features/cart/CartHeader";
import CartCard from "../features/cart/CartCard";
import EmptyCart from "../features/cart/EmptyCart";
import CartDiscountCard from "../features/cart/CartDiscountCard";
import CartAbstractCard from "../features/cart/CartAbstractCard";

export default function CartPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const items = useSelector((state: RootState) => state.cart.items);

  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const handleCheckout = () => {
    if (items.length === 0) {
      return;
    }
    console.log("ادامه خرید و تکمیل اطلاعات");
    navigate("/checkout");
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="mx-auto w-full max-w-md px-3 pb-32 pt-3 sm:max-w-2xl sm:px-5 sm:pb-10 sm:pt-5 lg:max-w-4xl">
        <CartHeader />
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <section aria-label="محصولات سبد خرید" className="space-y-3">
              {items.map((item) => (
                <CartCard key={item.product.id} item={item} />
              ))}
            </section>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  dispatch(clearCart());
                  console.log("پاک کردن سبد خرید");
                }}
                className="text-[10px] text-[#D9534F] transition-colors hover:text-[#DC2626]"
              >
                پاک کردن سبد خرید
              </button>
            </div>

            <CartDiscountCard
              setAppliedDiscount={setAppliedDiscount}
              subtotal={subtotal}
              appliedDiscount={appliedDiscount}
            />

            <CartAbstractCard
              subtotal={subtotal}
              appliedDiscount={appliedDiscount}
            />

            <button
              type="button"
              onClick={handleCheckout}
              className="mt-5 h-14 w-full items-center justify-center rounded-2xl bg-[#173C35] text-sm font-medium text-white shadow-md transition-all hover:bg-[#122f2a] focus:outline-none focus:ring-2 focus:ring-[#B8944E] focus:ring-offset-2 flex"
            >
              تکمیل اطلاعات و پرداخت
            </button>
          </>
        )}
      </div>
    </main>
  );
}
