import { redirect } from "next/navigation";
import Link from "next/link";

import { isAuthed } from "@/lib/auth";
import { logoutAction } from "../actions";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Quản trị" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthed())) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-secondary/30">
      <header className="bg-navy text-navy-foreground">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin/san-pham" className="font-display font-extrabold">
              Đồ Xịn Nhà Xinh
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/admin/san-pham"
                className="text-sm font-medium text-navy-foreground/80 transition-colors hover:text-navy-foreground"
              >
                Sản phẩm
              </Link>
              <Link
                href="/admin/bai-dang"
                className="text-sm font-medium text-navy-foreground/80 transition-colors hover:text-navy-foreground"
              >
                Bài đăng
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm text-navy-foreground/80 transition-colors hover:text-navy-foreground"
            >
              Xem web ↗
            </Link>
            <form action={logoutAction}>
              <Button
                type="submit"
                size="sm"
                variant="outline"
                className="border-white/30 bg-transparent text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
              >
                Đăng xuất
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
