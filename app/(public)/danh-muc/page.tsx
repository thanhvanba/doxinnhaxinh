import type { Metadata } from "next";

import { getCategories } from "@/lib/products";
import { CategoriesSection } from "@/components/categories-section";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Danh mục sản phẩm",
  description: "Khám phá sản phẩm đồ xịn theo từng danh mục tại Đồ Xịn Nhà Xinh.",
};

export default async function DanhMucPage() {
  const categories = await getCategories();
  return (
    <main>
      <CategoriesSection categories={categories} />
    </main>
  );
}
