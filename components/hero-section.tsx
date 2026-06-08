"use client";

import { Star, TrendingUp, Zap, Sparkles, Users } from "lucide-react";

import { FANPAGE_URL } from "@/lib/data";
import { Button } from "@/components/ui/button";

const pills = [
  { icon: Star, label: "Sản phẩm 5⭐" },
  { icon: TrendingUp, label: "Deal trending" },
  { icon: Zap, label: "Flash sale mỗi ngày" },
];

export function HeroSection() {
  const scrollToProducts = () =>
    document
      .getElementById("featured-products")
      ?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-linear-to-b from-primary/5 via-background to-background"
    >
      {/* Khối trang trí mờ */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-32 size-72 rounded-full bg-navy/15 blur-3xl" />

      <div className="container relative mx-auto grid items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        {/* Cột trái */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm font-medium shadow-sm">
            <Sparkles className="size-4 text-primary" />
            #1 Website Đồ Xịn Giá Tốt Việt Nam
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            <span className="text-primary">Đồ Xịn</span>{" "}
            <span className="text-navy">Nhà Xinh</span> Giá Yêu
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground lg:mx-0">
            Tuyển chọn hàng ngàn sản phẩm chất lượng cao cho ngôi nhà xinh xắn
            của bạn. Đồ xịn — giá yêu — ship nhanh từ Shopee!
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {pills.map((p) => (
              <span
                key={p.label}
                className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                <p.icon className="size-4 text-primary" />
                {p.label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button size="lg" className="font-bold" onClick={scrollToProducts}>
              🏠 Khám Phá Đồ Xịn Ngay
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold">
              <a href={FANPAGE_URL} target="_blank" rel="noopener noreferrer">
                🔔 Theo dõi Fanpage
              </a>
            </Button>
          </div>
        </div>

        {/* Cột phải — bento */}
        <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="col-span-2 overflow-hidden rounded-3xl bg-linear-to-br from-primary to-destructive p-6 text-primary-foreground shadow-lg">
            <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
              <Zap className="size-5" /> Flash Sale hôm nay
            </div>
            <div className="mt-3 font-display text-5xl font-extrabold">
              Giảm đến 70%
            </div>
            <p className="mt-2 text-sm opacity-90">
              Deal sốc cập nhật liên tục — nhanh tay kẻo lỡ!
            </p>
          </div>

          <div className="rounded-3xl bg-navy p-6 text-navy-foreground shadow-sm">
            <Users className="size-7" />
            <div className="mt-3 font-display text-3xl font-extrabold">100K+</div>
            <div className="text-sm text-navy-foreground/70">Gia đình tin dùng</div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <div className="mt-3 font-display text-3xl font-extrabold">4.9/5</div>
            <div className="text-sm text-muted-foreground">Đánh giá trung bình</div>
          </div>
        </div>
      </div>
    </section>
  );
}
