export interface Product {
  id: number;
  name: string;
  price: number;
  material: "ابریشم" | "نخی" | "وال اسلپ" | "ژاکارد";
  rating: number;
  reviewCount: number;
  availability: boolean;
  imageGallery: { id: number; label: string; src: string }[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "روسری ابریشم مامی",
    price: 1_500_000,
    material: "ابریشم",
    rating: 4.8,
    reviewCount: 24,
    availability: true,
    imageGallery: [
      { id: 1, label: "تصویر اصلی", src: "/products/silk/mummy/IMG_6156.JPG" },
      { id: 2, label: "نمای نزدیک", src: "/products/silk/mummy/IMG_6156.JPG" },
      {
        id: 3,
        label: "جزئیات محصول",
        src: "/products/silk/mummy/IMG_6156.JPG",
      },
      { id: 4, label: "نمای کامل", src: "/products/silk/mummy/IMG_6156.JPG" },
    ],
  },
  {
    id: 2,
    name: "روسری نخی منگوله‌دار",
    price: 1_390_000,
    material: "نخی",
    rating: 4.7,
    reviewCount: 24,
    availability: true,
    imageGallery: [
      { id: 1, label: "تصویر اصلی", src: "/products/cotton/IMG_6192.JPG" },
      { id: 2, label: "نمای نزدیک", src: "/products/cotton/IMG_6192.JPG" },
      {
        id: 3,
        label: "جزئیات محصول",
        src: "/products/cotton/IMG_6192.JPG",
      },
      { id: 4, label: "نمای کامل", src: "/products/cotton/IMG_6192.JPG" },
    ],
  },
  {
    id: 3,
    name: "روسری ژاکارد",
    price: 1_800_000,
    material: "ژاکارد",
    rating: 4.9,
    reviewCount: 24,
    availability: true,
    imageGallery: [
      { id: 1, label: "تصویر اصلی", src: "/products/zhakard/IMG_6163.JPG" },
      { id: 2, label: "نمای نزدیک", src: "/products/zhakard/IMG_6163.JPG" },
      {
        id: 3,
        label: "جزئیات محصول",
        src: "/products/zhakard/IMG_6163.JPG",
      },
      { id: 4, label: "نمای کامل", src: "/products/zhakard/IMG_6163.JPG" },
    ],
  },
  {
    id: 4,
    name: "روسری ابریشم دور نقره ای",
    price: 2_000_000,
    material: "ابریشم",
    rating: 4.9,
    reviewCount: 24,
    availability: true,
    imageGallery: [
      { id: 1, label: "تصویر اصلی", src: "/products/silk/silver/IMG_6153.JPG" },
      { id: 2, label: "نمای نزدیک", src: "/products/silk/silver/IMG_6153.JPG" },
      {
        id: 3,
        label: "جزئیات محصول",
        src: "/products/silk/silver/IMG_6153.JPG",
      },
      { id: 4, label: "نمای کامل", src: "/products/silk/silver/IMG_6153.JPG" },
    ],
  },
];
