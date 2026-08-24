import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="h-screen w-full">
      <div className="min-h-screen w-full overflow-x-hidden bg-[#FAF9F5] font-[Vazirmatn,sans-serif] text-[#222222]">
        <Header />
        <main className="w-full pb-20 md:pb-0">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
