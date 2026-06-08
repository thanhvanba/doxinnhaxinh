"use client";

import Image from "next/image";
import { Star, ExternalLink, Users, ShoppingBag, Eye } from "lucide-react";

import type { Product } from "@/lib/types";
import { formatPriceVND, formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type BadgeVariant = "default" | "secondary" | "destructive" | "success";

function badgeVariant(badge?: string): BadgeVariant {
  switch (badge) {
    case "Hot Sale":
    case "Flash Sale":
      return "destructive";
    case "Best Seller":
      return "success";
    case "Trending":
    case "Top Rated":
      return "default";
    default:
      return "secondary";
  }
}

export function ProductCard({
  product,
  soldPercent,
}: {
  product: Product;
  /** Khi có giá trị (0–100) sẽ hiện thanh "đã bán %" tạo urgency (dùng cho Flash Sale). */
  soldPercent?: number;
}) {
  const open = () => {
    const href = product.slug ? `/go/${product.slug}` : product.affiliateUrl;
    window.open(href, "_blank", "noopener,noreferrer");
  };
  const pct =
    typeof soldPercent === "number"
      ? Math.max(0, Math.min(100, soldPercent))
      : undefined;

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Ảnh */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-primary/10 via-card to-secondary">
            <ShoppingBag className="size-12 text-primary/40" />
            <span className="font-display text-sm font-bold text-primary/40">
              Đồ Xịn Nhà Xinh
            </span>
          </div>
        )}

        {product.badge && (
          <Badge
            variant={badgeVariant(product.badge)}
            className="absolute left-3 top-3 shadow-sm"
          >
            {product.badge}
          </Badge>
        )}

        {product.discount > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground shadow-sm">
            -{product.discount}%
          </div>
        )}

        {product.sold > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-foreground/70 px-2.5 py-1 text-[11px] font-medium text-background backdrop-blur-sm">
            <Users className="size-3" />
            Đã bán {formatCompact(product.sold)}
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">
          {product.name}
        </h3>

        {product.rating > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold">{product.rating}</span>
            {product.reviews > 0 && (
              <span className="text-muted-foreground">
                ({formatCompact(product.reviews)} đánh giá)
              </span>
            )}
          </div>
        )}

        {product.clicks > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> {formatCompact(product.clicks)} lượt
            quan tâm
          </div>
        )}

        {product.price > 0 ? (
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPriceVND(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="pb-0.5 text-sm text-muted-foreground line-through">
                {formatPriceVND(product.originalPrice)}
              </span>
            )}
          </div>
        ) : (
          <div className="text-base font-semibold text-primary">
            Xem giá trên Shopee
          </div>
        )}

        {pct !== undefined && (
          <div className="mt-auto space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-linear-to-r from-primary to-destructive"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-destructive">
              🔥 Đã bán {pct}%
            </p>
          </div>
        )}

        <Button
          onClick={open}
          className={cn("w-full font-semibold", pct === undefined && "mt-auto")}
          size="lg"
        >
          <ExternalLink className="size-4" />
          Mua trên Shopee
        </Button>
      </div>
    </div>
  );
}
