import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CategoryWithProducts } from "@/lib/products";
import { categoryIcon } from "@/lib/category-icons";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Theme nền cho mỗi khối danh mục — luân phiên: nền sáng nhạt rồi tới các nền
 * gradient ĐẬM (navy / cam-hồng) để tách bạch rõ ràng giữa các danh mục,
 * giống bố cục trang tham khảo (Đồ Công Nghệ nền navy, Thời Trang nền cam-hồng).
 * Card sản phẩm luôn trắng nên nổi bật trên nền màu.
 */
type Theme = {
  section: string;
  bold: boolean; // nền đậm → chữ sáng
};

const SOFT: Theme = { section: "bg-[#f7f8fa]", bold: false };
const NAVY: Theme = {
  section:
    "bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_45%,#312e81_100%)]",
  bold: true,
};
const SUNSET: Theme = {
  section:
    "bg-[linear-gradient(135deg,#f97316_0%,#ec4899_50%,#7c2d12_100%)]",
  bold: true,
};

/** idx chẵn → nền đậm (luân phiên NAVY / SUNSET); idx lẻ → nền sáng nhạt.
 *  → danh mục đầu tiên là nền đậm, tách hẳn khỏi khối "Nổi Bật" sáng phía trên. */
function themeFor(idx: number): Theme {
  if (idx % 2 === 1) return SOFT;
  return Math.floor(idx / 2) % 2 === 0 ? NAVY : SUNSET;
}

export function CategoryProductsSections({
  categories,
}: {
  categories: CategoryWithProducts[];
}) {
  if (categories.length === 0) return null;

  return (
    <>
      {categories.map((category, idx) => {
        const Icon = categoryIcon(category.icon);
        const theme = themeFor(idx);
        return (
          <section
            key={category.id}
            className={cn(
              theme.section,
              theme.bold ? "py-16 lg:py-20" : "py-12 lg:py-14",
            )}
          >
            <div className="container">
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-2xl",
                      theme.bold
                        ? "bg-white/15 text-white"
                        : "bg-primary/10 text-primary",
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h2
                      className={cn(
                        "font-display text-2xl font-extrabold tracking-tight md:text-3xl",
                        theme.bold && "text-white",
                      )}
                    >
                      {category.name}
                    </h2>
                    {category.product_count_label && (
                      <p
                        className={cn(
                          "text-sm",
                          theme.bold
                            ? "text-white/70"
                            : "text-muted-foreground",
                        )}
                      >
                        {category.product_count_label} sản phẩm
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "font-semibold",
                    theme.bold
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-primary hover:text-primary",
                  )}
                >
                  <Link href={`/danh-muc/${category.slug}`}>
                    Xem tất cả
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
