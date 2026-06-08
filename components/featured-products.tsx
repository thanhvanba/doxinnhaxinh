import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";

import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

export function FeaturedProducts({
  products,
  showViewAll = false,
}: {
  products: Product[];
  showViewAll?: boolean;
}) {
  return (
    <section id="featured-products" className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Flame className="size-4" /> Hot nhất
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Đồ Xịn Hot Nhất
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Những sản phẩm chất lượng cao được yêu thích nhất với giá hợp lý
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {showViewAll && (
          <div className="mt-10 text-center">
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <Link href="/san-pham">
                Xem Tất Cả Sản Phẩm
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
