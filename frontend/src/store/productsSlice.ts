import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProducts } from "../services/productApi";
import type { Product } from "../types/product";

interface ProductsState {
  items: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  loading: false,
  error: null,
};

// گرفتن لیست محصولات از بک‌اند
export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchProducts",
  async () => {
    const products = await getProducts();

    return products;
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
        state.error = "دریافت محصولات از سرور ناموفق بود.";
      });
  },
});

export default productsSlice.reducer;
