export function formatPriceVND(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

/** "1.2K", "3.4K", "560" — rút gọn số cho gọn UI. */
export function formatCompact(n: number): string {
  return new Intl.NumberFormat("vi-VN", { notation: "compact" }).format(n);
}
