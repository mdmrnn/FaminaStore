import { products } from "../data/products";
import ProductsHeader from "../features/products/ProductsHeader";
import ProductCard from "../features/products/ProductCard";

export default function ProductsPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]"
    >
      <div className="w-full px-3 pb-24 pt-3 sm:px-5 sm:pt-5 md:px-8 lg:px-10">
        <ProductsHeader />

        <section aria-label="محصولات" className="mt-3 w-full sm:mt-5">
          <div className="grid w-full grid-cols-2 gap-x-2.5 gap-y-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
