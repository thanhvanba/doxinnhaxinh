import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageOpen } from "lucide-react";

import {
  getCategories,
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/products";
import { categoryIcon } from "@/lib/category-icons";
import { ProductCard } from "@/components/product-card";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Không tìm thấy danh mục" };
  return {
    title: category.name,
    description: `Sản phẩm ${category.name} — đồ xịn giá tốt, deal hot từ Shopee.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(slug);
  const Icon = categoryIcon(category.icon);

  return (
    <main className="container mx-auto px-4 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Trang chủ
        </a>

        <div className="mt-6 flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-7" />
          </span>
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {products.length} sản phẩm
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted-foreground">
            <PackageOpen className="size-12" />
            <p>Chưa có sản phẩm nào trong danh mục này.</p>
          </div>
        )}
    </main>
  );
}
