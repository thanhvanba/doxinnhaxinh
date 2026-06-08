import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, ImageOff, Sparkles } from "lucide-react";

import { adminGetProducts } from "@/lib/admin-products";
import { getCategories } from "@/lib/products";
import { formatPriceVND } from "@/lib/format";
import { deleteProductAction } from "../../actions";
import { createPostFromProductAction } from "../../post-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteProductButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  if (status === "published")
    return <Badge variant="success">Đã đăng</Badge>;
  if (status === "approved") return <Badge>Đã duyệt</Badge>;
  return <Badge variant="secondary">Nháp</Badge>;
}

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    adminGetProducts(),
    getCategories(),
  ]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">
          Sản phẩm{" "}
          <span className="text-muted-foreground">({products.length})</span>
        </h1>
        <Button asChild className="font-semibold">
          <Link href="/admin/san-pham/moi">
            <Plus className="size-4" /> Thêm sản phẩm
          </Link>
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              {p.image_url ? (
                <Image
                  src={p.image_url}
                  alt={p.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-semibold">{p.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>
                  {p.price > 0 ? formatPriceVND(p.price) : "Chưa có giá"}
                </span>
                <span>·</span>
                <span>{p.category_id ? catName[p.category_id] : "Chưa phân loại"}</span>
                {p.is_featured && <span className="text-primary">Nổi bật</span>}
                {p.is_flash_deal && <span className="text-destructive">Flash</span>}
                {!p.image_url && <span className="text-destructive">Thiếu ảnh</span>}
              </div>
            </div>

            <div className="hidden sm:block">{statusBadge(p.status)}</div>

            <form action={createPostFromProductAction} className="hidden md:block">
              <input type="hidden" name="product_id" value={p.id} />
              <Button type="submit" variant="secondary" size="sm">
                <Sparkles className="size-3.5" /> Tạo bài
              </Button>
            </form>

            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/san-pham/${p.id}`}>
                <Pencil className="size-3.5" /> Sửa
              </Link>
            </Button>
            <DeleteProductButton id={p.id} action={deleteProductAction} />
          </div>
        ))}
      </div>
    </div>
  );
}
