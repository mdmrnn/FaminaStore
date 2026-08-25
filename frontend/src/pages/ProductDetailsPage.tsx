import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";

import type { AppDispatch, RootState } from "../store/store";

import { fetchProducts } from "../store/productsSlice";

import ProductDetailsHeader from "../features/productDetails/ProductDetailsHeader";
import ProductDetailsImageGallery from "../features/productDetails/ProductDetailsImageGallery";
import ProductDetailsDetail from "../features/productDetails/ProductDetailsDetail";

export default function ProductDetailsPage() {
  const [isFavorite, setIsFavorite] = useState(false);

  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();

  const { items: products, loading } = useSelector(
    (state: RootState) => state.products,
  );

  useEffect(() => {
    if (products.length === 0 && !loading) {
      dispatch(fetchProducts());
    }
  }, [dispatch]);

  if (loading) {
    return <p>در حال دریافت محصولات از سرور...</p>;
  }

  const product = products.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <div className="p-8 text-center text-[#173C35]">محصولی یافت نشد!</div>
    );
  }

  const handleFavorite = () => {
    setIsFavorite((previous) => !previous);
    console.log(`علاقه‌مندی: ${product.name}`);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="w-full px-3 pb-32 pt-3 sm:px-5 sm:pb-10 sm:pt-5 md:px-8 lg:px-10">
        <ProductDetailsHeader
          isFavorite={isFavorite}
          handleFavorite={handleFavorite}
        />

        <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] md:items-start md:gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductDetailsImageGallery
            isFavorite={isFavorite}
            handleFavorite={handleFavorite}
            product={product}
          />
          <ProductDetailsDetail
            isFavorite={isFavorite}
            handleFavorite={handleFavorite}
            product={product}
          />
        </div>
      </div>
    </main>
  );
}
