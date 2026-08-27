import { findAllProducts } from "../repositories/productRepository.js";

export function getProducts(req, res) {
  return res.status(200).json(findAllProducts());
}
