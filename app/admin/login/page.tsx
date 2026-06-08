import { redirect } from "next/navigation";

import { isAuthed } from "@/lib/auth";
import { loginAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Đăng nhập quản trị" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAuthed()) redirect("/admin/san-pham");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl font-extrabold text-navy">
          Đồ Xịn Nhà Xinh
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Đăng nhập trang quản trị
        </p>
        <Input
          name="password"
          type="password"
          placeholder="Mật khẩu"
          required
          autoFocus
          className="mt-6"
        />
        {error && (
          <p className="mt-2 text-sm text-destructive">Sai mật khẩu, thử lại.</p>
        )}
        <Button type="submit" className="mt-4 w-full font-semibold">
          Đăng nhập
        </Button>
      </form>
    </main>
  );
}
