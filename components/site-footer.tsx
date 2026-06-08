import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube } from "lucide-react";

import type { CategoryRow } from "@/lib/products";
import { FANPAGE_URL } from "@/lib/data";

const supportLinks = [
  { label: "Tất cả sản phẩm", href: "/san-pham" },
  { label: "Flash Sale", href: "/flash-sale" },
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Danh mục", href: "/danh-muc" },
];

export function SiteFooter({ categories }: { categories: CategoryRow[] }) {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="inline-flex items-center rounded-xl bg-white p-2.5">
              <Image
                src="/logo.png"
                alt="Đồ Xịn Nhà Xinh"
                width={150}
                height={112}
                className="h-12 w-auto"
              />
            </div>
            <p className="mt-4 text-sm text-navy-foreground/70">
              Tìm kiếm và chia sẻ những sản phẩm chất lượng cao với giá tốt nhất
              từ Shopee. Đồ xịn cho nhà xinh!
            </p>
            <div className="mt-4 flex gap-3">
              <a
                href={FANPAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-navy-foreground/70 transition-colors hover:text-primary"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-navy-foreground/70 transition-colors hover:text-primary"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="text-navy-foreground/70 transition-colors hover:text-primary"
              >
                <Youtube className="size-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Danh mục</h3>
            <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
              {categories.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/danh-muc/${c.slug}`}
                    className="transition-colors hover:text-navy-foreground"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Thông tin</h3>
            <ul className="mt-4 space-y-2 text-sm text-navy-foreground/70">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-navy-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Theo dõi chúng tôi</h3>
            <p className="mt-4 text-sm text-navy-foreground/70">
              Nhận thông báo về các deal hot mới nhất
            </p>
            <a
              href={FANPAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Facebook className="size-4" /> Theo dõi Fanpage
            </a>
          </div>
        </div>

        <div className="mt-12 space-y-3 border-t border-white/15 pt-8 text-center text-sm text-navy-foreground/70">
          <p className="mx-auto max-w-3xl text-xs">
            Đồ Xịn Nhà Xinh là trang giới thiệu sản phẩm tiếp thị liên kết
            (affiliate), tổng hợp deal từ Shopee. Chúng tôi hoạt động độc lập,
            không phải là Shopee và không trực tiếp bán hàng. Mọi giao dịch,
            giá và chính sách do nhà bán trên Shopee quyết định.
          </p>
          <p>© 2026 Đồ Xịn Nhà Xinh. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
