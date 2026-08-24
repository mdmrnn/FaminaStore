import Hero from "../features/home/Hero.tsx";
import Catogories from "../features/home/Catogories.tsx";
import SpecialOffers from "../features/home/SpecialOffers.tsx";

export default function HomePage() {
  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]">
      <Hero />
      <Catogories />
      <SpecialOffers />
    </main>
  );
}
