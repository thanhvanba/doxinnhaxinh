import { HeroSection } from "@/components/hero-section";
import { TrendingSection } from "@/components/trending-section";
import { FeaturedProducts } from "@/components/featured-products";
import { CategoryProductsSections } from "@/components/category-products-section";
import { FaqSection } from "@/components/faq-section";
import { NewsletterSection } from "@/components/newsletter-section";
import {
  getFeaturedProducts,
  getTrendingProducts,
  getCategoriesWithProducts,
} from "@/lib/products";

// Đọc lại từ DB sau mỗi 5 phút (ISR).
export const revalidate = 300;

export default async function Home() {
  const [trending, featured, categories] = await Promise.all([
    getTrendingProducts(10),
    getFeaturedProducts(8),
    getCategoriesWithProducts(8),
  ]);

  return (
    <main>
      {/* 1. Banner */}
      <HeroSection />
      {/* 2. TOP BÁN CHẠY — xếp hạng theo lượt quan tâm */}
      <TrendingSection products={trending} />
      {/* 3. Sản phẩm nổi bật */}
      <FeaturedProducts products={featured} showViewAll />
      {/* 4. Các khối sản phẩm theo từng danh mục */}
      <CategoryProductsSections categories={categories} />
      {/* 5. Câu hỏi thường gặp */}
      <FaqSection />
      {/* 6. Đăng ký nhận tin */}
      <NewsletterSection />
    </main>
  );
}
