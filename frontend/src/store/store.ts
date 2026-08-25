// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import type { Product } from "../types/product";
import cartReducer, { type CartState } from "./cartSlice";
import productsReducer from "./productsSlice";

const CART_STORAGE_KEY = "famina-scarf-cart";

const isProduct = (value: unknown): value is Product => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const product = value as Record<string, unknown>;

  const validMaterial =
    product.material === "ابریشم" ||
    product.material === "نخی" ||
    product.material === "وال اسلپ" ||
    product.material === "ژاکارد";

  const validImageGallery =
    Array.isArray(product.imageGallery) &&
    product.imageGallery.every((image) => {
      if (typeof image !== "object" || image === null) {
        return false;
      }

      const imageData = image as Record<string, unknown>;

      return (
        typeof imageData.id === "number" &&
        typeof imageData.label === "string" &&
        typeof imageData.src === "string"
      );
    });

  return (
    typeof product.id === "number" &&
    typeof product.name === "string" &&
    typeof product.price === "number" &&
    validMaterial &&
    typeof product.rating === "number" &&
    typeof product.reviewCount === "number" &&
    typeof product.availability === "boolean" &&
    validImageGallery
  );
};

const isCartState = (value: unknown): value is CartState => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const cart = value as Record<string, unknown>;

  if (!Array.isArray(cart.items)) {
    return false;
  }

  return cart.items.every((item) => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const cartItem = item as Record<string, unknown>;

    return (
      isProduct(cartItem.product) &&
      typeof cartItem.quantity === "number" &&
      Number.isInteger(cartItem.quantity) &&
      cartItem.quantity > 0
    );
  });
};

const loadCartState = (): CartState => {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return { items: [] };
    }

    const parsedCart: unknown = JSON.parse(storedCart);

    return isCartState(parsedCart) ? parsedCart : { items: [] };
  } catch {
    return { items: [] };
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productsReducer,
  },
  preloadedState: {
    cart: loadCartState(),
  },
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    try {
      const cartState = store.getState().cart;

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    } catch {
      // Ignore localStorage errors such as quota or restricted storage.
    }
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
