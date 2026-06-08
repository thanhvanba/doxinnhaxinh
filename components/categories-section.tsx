import type { CategoryRow } from "@/lib/products";
import { categoryIcon } from "@/lib/category-icons";
import { Badge } from "@/components/ui/badge";

export function CategoriesSection({
  categories,
}: {
  categories: CategoryRow[];
}) {
  return (
    <section id="categories" className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Danh Mục Nổi Bật
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Khám phá hàng ngàn sản phẩm chất lượng theo từng danh mục
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIcon(category.icon);
            return (
              <a
                key={category.id}
                href={`/danh-muc/${category.slug}`}
                className="group relative flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                {category.is_hot && (
                  <Badge variant="destructive" className="absolute right-3 top-3">
                    HOT
                  </Badge>
                )}
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-7" />
                </span>
                <div>
                  <h3 className="text-sm font-bold leading-snug">
                    {category.name}
                  </h3>
                  {category.product_count_label && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {category.product_count_label} sản phẩm
                    </p>
                  )}
                  {category.discount_label && (
                    <p className="mt-0.5 text-xs font-semibold text-primary">
                      {category.discount_label}
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
