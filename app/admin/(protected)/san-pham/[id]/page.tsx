import { notFound } from "next/navigation";

import { adminGetProduct } from "@/lib/admin-products";
import { getCategories } from "@/lib/products";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "moi";

  const [product, categories] = await Promise.all([
    isNew ? Promise.resolve(null) : adminGetProduct(id),
    getCategories(),
  ]);

  if (!isNew && !product) notFound();

  return <ProductForm product={product} categories={categories} />;
}
