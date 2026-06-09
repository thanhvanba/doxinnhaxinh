"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ImageOff, Star } from "lucide-react";

import type { CategoryRow } from "@/lib/products";

const selectCls =
  "h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

/** Thanh lọc/tìm/sắp xếp — đẩy mọi thay đổi lên URL searchParams. */
export function ProductsToolbar({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Gộp nhiều thay đổi param, luôn reset page (trừ khi chính page đổi).
  function setParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in updates)) next.delete("page");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  // Search có debounce (tự viết, không cần thư viện).
  const [q, setQ] = useState(sp.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Đồng bộ khi URL đổi từ bên ngoài (vd nút Back).
  useEffect(() => {
    setQ(sp.get("q") ?? "");
  }, [sp]);

  function onSearchChange(value: string) {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParams({ q: value }), 350);
  }

  // Chip bật/tắt: param "1" ↔ bỏ.
  function toggleChip(key: string) {
    setParams({ [key]: sp.get(key) === "1" ? null : "1" });
  }
  const chipCls = (on: boolean) =>
    `inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
      on
        ? "border-primary bg-primary/10 text-primary"
        : "border-input text-muted-foreground hover:text-foreground"
    }`;
  const missingOn = sp.get("missing") === "1";
  const featuredOn = sp.get("featured") === "1";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm tên hoặc mã sản phẩm (item_id)…"
          className={`${selectCls} w-full pl-9`}
        />
      </div>

      <select
        value={sp.get("cat") ?? ""}
        onChange={(e) => setParams({ cat: e.target.value })}
        className={selectCls}
        aria-label="Lọc danh mục"
      >
        <option value="">Tất cả danh mục</option>
        <option value="none">— Chưa phân loại —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={sp.get("sort") ?? "new"}
        onChange={(e) => setParams({ sort: e.target.value })}
        className={selectCls}
        aria-label="Sắp xếp"
      >
        <option value="new">Mới nhất</option>
        <option value="hot">Hot nhất (lượt xem)</option>
        <option value="price_desc">Giá cao → thấp</option>
        <option value="price_asc">Giá thấp → cao</option>
      </select>

      <select
        value={sp.get("pageSize") ?? "15"}
        onChange={(e) => setParams({ pageSize: e.target.value })}
        className={selectCls}
        aria-label="Số dòng mỗi trang"
      >
        <option value="15">15 / trang</option>
        <option value="30">30 / trang</option>
        <option value="50">50 / trang</option>
        <option value="100">100 / trang</option>
      </select>

      <button
        type="button"
        onClick={() => toggleChip("missing")}
        className={chipCls(missingOn)}
        aria-pressed={missingOn}
      >
        <ImageOff className="size-4" /> Thiếu ảnh
      </button>

      <button
        type="button"
        onClick={() => toggleChip("featured")}
        className={chipCls(featuredOn)}
        aria-pressed={featuredOn}
      >
        <Star className="size-4" /> Nổi bật
      </button>
    </div>
  );
}
