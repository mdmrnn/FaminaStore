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
