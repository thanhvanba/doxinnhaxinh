"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Pencil, ImageOff, Sparkles, Eye, Trash2, RotateCcw } from "lucide-react";

import type { AdminProduct } from "@/lib/admin-products";
import type { CategoryRow } from "@/lib/products";
import { formatPriceVND } from "@/lib/format";
import {
  bulkProductAction,
  deleteProductAction,
  restoreProductAction,
} from "@/app/admin/actions";
import { createPostFromProductAction } from "@/app/admin/post-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulkBar } from "@/components/admin/bulk-bar";

function statusBadge(status: string) {
  if (status === "published") return <Badge variant="success">Đã đăng</Badge>;
  if (status === "approved") return <Badge>Đã duyệt</Badge>;
  if (status === "archived") return <Badge variant="secondary">Đã xóa</Badge>;
  return <Badge variant="secondary">Nháp</Badge>;
}

export function ProductsTable({
  rows,
  categories,
  catName,
  isTrash,
  returnTo,
}: {
  rows: AdminProduct[];
  categories: CategoryRow[];
  catName: Record<string, string>;
  isTrash: boolean;
  returnTo: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)),
    );
  }

  const allChecked = rows.length > 0 && selected.size === rows.length;

  return (
    <>
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Chọn tất cả"
                  className="size-4 accent-primary"
                />
              </th>
              <th className="w-14 px-3 py-2.5 font-medium">Ảnh</th>
              <th className="px-3 py-2.5 font-medium">Sản phẩm</th>
              <th className="px-3 py-2.5 font-medium">Giá</th>
              <th className="hidden px-3 py-2.5 font-medium md:table-cell">
                Danh mục
              </th>
              <th className="hidden px-3 py-2.5 font-medium sm:table-cell">
                Lượt xem
              </th>
              <th className="px-3 py-2.5 font-medium">Trạng thái</th>
              <th className="px-3 py-2.5 text-right font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-12 text-center text-muted-foreground"
                >
                  {isTrash
                    ? "Thùng rác trống."
                    : "Không có sản phẩm khớp bộ lọc."}
                </td>
              </tr>
            )}
            {rows.map((p) => {
              const checked = selected.has(p.id);
              return (
                <tr
                  key={p.id}
                  data-selected={checked || undefined}
                  className="border-b last:border-0 hover:bg-muted/40 data-[selected]:bg-primary/5"
                >
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.id)}
                      aria-label={`Chọn ${p.name}`}
                      className="size-4 accent-primary"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative size-11 overflow-hidden rounded-lg bg-muted">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <ImageOff className="size-4" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="line-clamp-1 font-medium">{p.name}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {p.shopee_item_id && <span>#{p.shopee_item_id}</span>}
                      {p.is_featured && (
                        <span className="text-primary">Nổi bật</span>
                      )}
                      {p.is_flash_deal && (
                        <span className="text-destructive">Flash</span>
                      )}
                      {!p.image_url && (
                        <span className="text-destructive">Thiếu ảnh</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {p.price > 0 ? (
                      formatPriceVND(p.price)
                    ) : (
                      <span className="text-muted-foreground">Chưa có giá</span>
                    )}
                  </td>
                  <td className="hidden px-3 py-2 text-muted-foreground md:table-cell">
                    {p.category_id ? catName[p.category_id] : "Chưa phân loại"}
                  </td>
                  <td className="hidden px-3 py-2 text-muted-foreground sm:table-cell">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" /> {p.clicks ?? 0}
                    </span>
                  </td>
                  <td className="px-3 py-2">{statusBadge(p.status)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1.5">
                      {isTrash ? (
                        <form action={restoreProductAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <Button type="submit" variant="outline" size="sm">
                            <RotateCcw className="size-3.5" /> Khôi phục
                          </Button>
                        </form>
                      ) : (
                        <>
                          <form
                            action={createPostFromProductAction}
                            className="hidden lg:block"
                          >
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
                          <form
                            action={deleteProductAction}
                            onSubmit={(e) => {
                              if (!confirm("Chuyển sản phẩm này vào Thùng rác?"))
                                e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              aria-label="Xóa"
                              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected.size > 0 && (
        <BulkBar
          ids={Array.from(selected)}
          categories={categories}
          isTrash={isTrash}
          returnTo={returnTo}
          action={bulkProductAction}
          onClear={() => setSelected(new Set())}
        />
      )}
    </>
  );
}
