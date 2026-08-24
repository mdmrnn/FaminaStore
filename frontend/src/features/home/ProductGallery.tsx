import { useRef, useState } from "react";

const heroImages = [
  "/products/hero/blk.JPG",
  "/products/hero/sun.JPG",
  "/products/hero/zhk.JPG",
  "/products/hero/watch.JPG",
];

export default function ProductGallery() {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(heroImages.length - 1);

  const handleScroll = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const slideWidth = slider.clientWidth;

    if (slideWidth === 0) return;

    const currentIndex = Math.round(
      heroImages.length - 1 - slider.scrollLeft / slideWidth,
    );

    setActiveIndex(Math.min(currentIndex, heroImages.length - 1));
  };

  return (
    <div className="order-2 lg:order-1">
      <div className="relative aspect-[1.15/1] w-full overflow-hidden rounded-3xl border border-[#E7E5DF] bg-[#FAF9F5] sm:rounded-[30px] lg:aspect-[1.05/1]">
        <div className="order-2 lg:order-1">
          <div className="relative aspect-[1.15/1] w-full overflow-hidden rounded-3xl border border-[#E7E5DF] bg-[#FAF9F5] sm:rounded-[30px] lg:aspect-[1.05/1]">
            {/* Slider */}
            <div
              ref={sliderRef}
              dir="ltr"
              onScroll={handleScroll}
              className="scrollbar-hide flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
            >
              {heroImages.map((image, index) => (
                <div key={image} className="h-full w-full shrink-0 snap-start">
                  <img
                    src={image}
                    alt={`Silk Watch ${index + 1}`}
                    className="block h-full w-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
              {heroImages.map((_, index) => (
                <span
                  key={index}
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? "w-5 bg-[#B8944E]"
                      : "w-1.5 bg-[#D2D0C9]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
