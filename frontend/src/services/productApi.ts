import type { Product } from "../types/product";
import { apiUrl } from "./apiBase";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(apiUrl("/api/products"));

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const data: Product[] = await response.json();

  // Normalize image URLs with API_BASE_URL and /public prefix if missing

  return data.map((product) => ({
    ...product,
    imageGallery: product.imageGallery.map((img) => ({
      ...img,
      src: apiUrl(img.src),
    })),
  }));
}
