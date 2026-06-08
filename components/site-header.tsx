"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Search, Home, ChevronDown } from "lucide-react";

import type { CategoryRow } from "@/lib/products";
import { FANPAGE_URL } from "@/lib/data";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link
      href="/"
      className="flex shrink-0 items-center"
      aria-label="Đồ Xịn Nhà Xinh"
    >
      <Image
        src="/logo.png"
        alt="Đồ Xịn Nhà Xinh"
        width={118}
        height={88}
        priority
        className="h-11 w-auto"
      />
    </Link>
  );
}

function SearchBox({ className }: { className?: string }) {
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => e.preventDefault()}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Tìm sản phẩm..."
        aria-label="Tìm kiếm sản phẩm"
        className="h-10 w-full rounded-full border bg-secondary/50 pl-11 pr-4 text-sm outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
      />
    </form>
  );
}

export function SiteHeader({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center gap-3 md:gap-5">
        <Logo />

        {/* Ô tìm kiếm — ở giữa (giống trang tham khảo) */}
        <SearchBox className="hidden flex-1 md:block lg:max-w-xl" />

        {/* Nav phải */}
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          <Link
            href="/"
            aria-label="Trang chủ"
            className="flex size-9 items-center justify-center rounded-full bg-secondary text-foreground/70 transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Home className="size-4" />
          </Link>

          {/* Sản phẩm — dropdown danh mục */}
          <div className="group relative">
            <Link
              href="/san-pham"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
            >
              Sản phẩm
              <ChevronDown className="size-4 transition-transform group-hover:rotate-180" />
            </Link>

            <div className="invisible absolute right-0 top-full w-60 pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="overflow-hidden rounded-2xl border bg-card p-1.5 shadow-lg">
                <Link
                  href="/san-pham"
                  className="block rounded-lg px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-accent"
                >
                  Tất cả sản phẩm
                </Link>
                <div className="my-1 h-px bg-border" />
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/danh-muc/${c.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/flash-sale"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            Flash Sale
          </Link>
          <Link
            href="/gioi-thieu"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            Giới thiệu
          </Link>
          <a
            href={FANPAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-primary"
          >
            Liên hệ
          </a>
        </nav>

        {/* Mobile toggle */}
        <button
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <div className="container flex flex-col gap-1 py-4">
            <SearchBox className="mb-2" />

            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              Trang chủ
            </Link>

            {/* Sản phẩm — mục mở rộng */}
            <button
              onClick={() => setProductsOpen((v) => !v)}
              aria-expanded={productsOpen}
              className="flex items-center justify-between rounded-lg px-2 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              Sản phẩm
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  productsOpen && "rotate-180",
                )}
              />
            </button>
            {productsOpen && (
              <div className="ml-3 flex flex-col border-l pl-3">
                <Link
                  href="/san-pham"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
                >
                  Tất cả sản phẩm
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/danh-muc/${c.slug}`}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm text-foreground/70 transition-colors hover:bg-accent hover:text-primary"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}

            <Link
              href="/flash-sale"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              Flash Sale
            </Link>
            <Link
              href="/gioi-thieu"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              Giới thiệu
            </Link>
            <a
              href={FANPAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2 py-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary"
            >
              Liên hệ
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
