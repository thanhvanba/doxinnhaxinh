"use client";

import { useState, useEffect } from "react";
import { Clock, Zap, ArrowRight } from "lucide-react";

import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Phần trăm "đã bán" mang tính minh hoạ (chưa có tồn kho thật).
function soldPercent(sold: number) {
  return Math.min(92, 55 + (sold % 40));
}

export function FlashDealsSection({ products }: { products: Product[] }) {
  const [time, setTime] = useState({ hours: 3, minutes: 45, seconds: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((p) => {
        if (p.seconds > 0) return { ...p, seconds: p.seconds - 1 };
        if (p.minutes > 0) return { ...p, minutes: p.minutes - 1, seconds: 59 };
        if (p.hours > 0) return { hours: p.hours - 1, minutes: 59, seconds: 59 };
        return p;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const units = [
    { value: time.hours, label: "Giờ" },
    { value: time.minutes, label: "Phút" },
    { value: time.seconds, label: "Giây" },
  ];

  return (
    <section
      id="deals"
      className="bg-linear-to-br from-destructive/5 via-background to-primary/5 py-16 lg:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-sm font-semibold text-destructive">
            <Zap className="size-4" /> Giá sốc có hạn
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Flash Sale
          </h2>

          <div className="mt-5 flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Clock className="size-4 text-destructive" /> Kết thúc trong
            </span>
            <div className="flex items-center gap-1.5">
              {units.map((u, i) => (
                <div key={u.label} className="flex items-center gap-1.5">
                  <div className="flex flex-col items-center">
                    <span className="min-w-11 rounded-lg bg-destructive px-2 py-1.5 text-center font-display text-lg font-bold tabular-nums text-destructive-foreground shadow-sm">
                      {pad(u.value)}
                    </span>
                    <span className="mt-1 text-[11px] text-muted-foreground">
                      {u.label}
                    </span>
                  </div>
                  {i < units.length - 1 && (
                    <span className="pb-4 font-bold text-destructive">:</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-muted-foreground">
            ⚡ Nhanh tay kẻo lỡ — số lượng có hạn!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              soldPercent={soldPercent(product.sold)}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button size="lg" variant="destructive" className="font-bold">
            Xem Tất Cả Flash Sale
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
