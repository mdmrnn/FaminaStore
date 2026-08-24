export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
}

export function formatPrice(price: number): string {
  return toPersianDigits(price.toLocaleString("en-US"));
}
