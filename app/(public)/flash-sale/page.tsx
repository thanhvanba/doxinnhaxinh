import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";

import { getFlashDeals } from "@/lib/products";
import { FlashDealsSection } from "@/components/flash-deals-section";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Flash Sale",
  description: "Săn deal sốc giá hời có hạn tại Đồ Xịn Nhà Xinh.",
};

export default async function FlashSalePage() {
  const flash = await getFlashDeals();

  if (flash.length === 0) {
    return (
      <main className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Zap className="size-8" />
        </span>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Chưa có Flash Sale
        </h1>
        <p className="max-w-md text-muted-foreground">
          Hiện chưa có deal flash nào đang chạy. Ghé lại sau hoặc xem các sản
          phẩm đồ xịn khác nhé!
        </p>
        <Button asChild size="lg" className="font-semibold">
          <Link href="/san-pham">Xem tất cả sản phẩm</Link>
        </Button>
      </main>
    );
  }

  return (
    <main>
      <FlashDealsSection products={flash} />
    </main>
  );
}
