"use client";

import { useState } from "react";
import { Mail, Gift } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: nối backend gửi email ở GĐ sau.
    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-primary to-navy px-6 py-14 text-center text-primary-foreground shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/15">
              <Gift className="size-8" />
            </span>
            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Nhận Đồ Xịn Mỗi Ngày!
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg opacity-90">
              Đăng ký nhận thông báo về sản phẩm chất lượng, deal hot và voucher
              miễn phí
            </p>

            {!subscribed ? (
              <form
                onSubmit={handleSubmit}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    className="h-12 w-full rounded-lg border border-transparent bg-background pl-10 pr-4 text-foreground shadow-sm outline-none transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-white/60"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-background font-bold text-primary hover:bg-background/90"
                >
                  Đăng Ký Ngay
                </Button>
              </form>
            ) : (
              <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white/15 p-6 backdrop-blur-sm">
                <div className="text-2xl">🎉</div>
                <h3 className="mt-2 text-xl font-bold">
                  Chào mừng đến gia đình Đồ Xịn Nhà Xinh!
                </h3>
                <p className="mt-1 opacity-90">
                  Bạn sẽ nhận được những deal đồ xịn đầu tiên trong vòng 24h tới.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm opacity-90 sm:flex-row sm:gap-6">
              <span>✅ Miễn phí 100%</span>
              <span>✅ Không spam</span>
              <span>✅ Hủy đăng ký bất cứ lúc nào</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
