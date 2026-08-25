import type { Product } from "../../types/product";

export async function getProducts(): Promise<Product[]> {
  const response = await fetch("http://localhost:5000/api/products");
  const data = await response.json();
  return data;
}
