import Image from "next/image";
import { Flame, Eye, ExternalLink } from "lucide-react";

import type { Product } from "@/lib/types";
import { formatPriceVND, formatCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

function rankClass(i: number) {
  if (i === 0) return "bg-primary text-primary-foreground";
  if (i === 1) return "bg-navy text-navy-foreground";
  if (i === 2) return "bg-amber-500 text-white";
  return "bg-secondary text-secondary-foreground";
}

export function TrendingSection({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="bg-secondary/40 py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <Flame className="size-4" /> Được quan tâm nhất
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Bảng Xếp Hạng Hot
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Top sản phẩm được nhiều người bấm xem nhất
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {products.map((p, i) => (
            <a
              key={p.id}
              href={p.slug ? `/go/${p.slug}` : p.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-2xl border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-extrabold",
                  rankClass(i),
                )}
              >
                {i + 1}
              </span>

              <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ExternalLink className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
                  {p.name}
                </h3>
                <div className="mt-1 flex items-center gap-3 text-xs">
                  {p.price > 0 && (
                    <span className="font-bold text-primary">
                      {formatPriceVND(p.price)}
                    </span>
                  )}
                  {p.clicks > 0 && (
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="size-3.5" /> {formatCompact(p.clicks)}
                    </span>
                  )}
                </div>
              </div>

              <span className="hidden shrink-0 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition-colors group-hover:bg-primary/90 sm:inline-block">
                Mua
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
