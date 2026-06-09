import Link from "next/link";
import { Plus } from "lucide-react";

import {
  adminListProducts,
  adminProductStatusCounts,
  type ListParams,
  type ProductSort,
} from "@/lib/admin-products";
import { getCategories } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { ProductsToolbar } from "@/components/admin/products-toolbar";
import { ProductsTable } from "@/components/admin/products-table";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

/** Build href giữ nguyên các param hiện tại, ghi đè/loại bỏ theo `over`. */
function hrefWith(sp: SP, over: Record<string, string | null>): string {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v) next.set(k, v);
  for (const [k, v] of Object.entries(over)) {
    if (v === null || v === "") next.delete(k);
    else next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `/admin/san-pham?${qs}` : "/admin/san-pham";
}

const TABS: {
  key: string;
  label: string;
  countKey: keyof Awaited<ReturnType<typeof adminProductStatusCounts>>;
}[] = [
  { key: "", label: "Tất cả", countKey: "all" },
  { key: "draft", label: "Nháp", countKey: "draft" },
  { key: "approved", label: "Đã duyệt", countKey: "approved" },
  { key: "published", label: "Đã đăng", countKey: "published" },
  { key: "archived", label: "Thùng rác", countKey: "archived" },
];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const params: ListParams = {
    q: sp.q,
    cat: sp.cat,
    status: sp.status,
    featured: sp.featured === "1",
    missing: sp.missing === "1",
    sort: (sp.sort as ProductSort) || "new",
    page: Number(sp.page) || 1,
    pageSize: Number(sp.pageSize) || 15,
  };

  const [{ rows, total }, counts, categories] = await Promise.all([
    adminListProducts(params),
    adminProductStatusCounts(),
    getCategories(),
  ]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 15;
  const from = (page - 1) * pageSize;
  const shownTo = Math.min(from + pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const activeStatus = sp.status ?? "";
  const isTrash = activeStatus === "archived";
  const returnTo = hrefWith(sp, {});

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">
          Sản phẩm <span className="text-muted-foreground">({total})</span>
        </h1>
        <Button asChild className="font-semibold">
          <Link href="/admin/san-pham/moi">
            <Plus className="size-4" /> Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Tabs trạng thái (có số đếm) */}
      <div className="mt-5 flex flex-wrap gap-1 border-b">
        {TABS.map((t) => {
          const active = activeStatus === t.key;
          return (
            <Link
              key={t.key || "all"}
              href={hrefWith(sp, { status: t.key || null, page: null })}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}{" "}
              <span className="text-xs text-muted-foreground">
                {counts[t.countKey]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4">
        <ProductsToolbar categories={categories} />
      </div>

      <div className="mt-4">
        <ProductsTable
          rows={rows}
          categories={categories}
          catName={catName}
          isTrash={isTrash}
          returnTo={returnTo}
        />
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {total > 0 ? `${from + 1}–${shownTo}` : 0} / {total}
        </span>
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page <= 1 ? "pointer-events-none opacity-50" : ""}
          >
            <Link href={hrefWith(sp, { page: page > 2 ? String(page - 1) : null })}>
              ‹ Trước
            </Link>
          </Button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <Button
            asChild
            variant="outline"
            size="sm"
            className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
          >
            <Link href={hrefWith(sp, { page: String(page + 1) })}>Sau ›</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
