import type { Metadata } from "next";
import Link from "next/link";

import { getPublishedProducts, getCategories } from "@/lib/products";
import { ProductCard } from "@/components/product-card";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tất cả sản phẩm",
  description: "Toàn bộ sản phẩm đồ xịn giá tốt, deal hot từ Shopee.",
};

export default async function SanPhamPage() {
  const [products, categories] = await Promise.all([
    getPublishedProducts(),
    getCategories(),
  ]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Tất Cả Sản Phẩm
        </h1>
        <p className="mt-2 text-muted-foreground">
          {products.length} sản phẩm đồ xịn được tuyển chọn
        </p>
      </div>

      {/* Chip lọc theo danh mục */}
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/danh-muc/${c.slug}`}
            className="rounded-full border bg-card px-4 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
