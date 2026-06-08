import Link from "next/link";
import Image from "next/image";
import { Pencil, ImageOff } from "lucide-react";

import { adminGetPosts } from "@/lib/posts";
import { deletePostAction } from "../../post-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProductButton } from "@/components/admin/delete-button";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  if (status === "published") return <Badge variant="success">Đã đăng</Badge>;
  if (status === "approved") return <Badge>Đã duyệt</Badge>;
  if (status === "failed") return <Badge variant="destructive">Lỗi</Badge>;
  return <Badge variant="secondary">Nháp</Badge>;
}

export default async function AdminPostsPage() {
  const posts = await adminGetPosts();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-extrabold">
          Bài đăng <span className="text-muted-foreground">({posts.length})</span>
        </h1>
        <Button asChild variant="outline">
          <Link href="/admin/san-pham">Tạo bài từ sản phẩm</Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          Chưa có bài đăng. Vào <Link href="/admin/san-pham" className="text-primary hover:underline">Sản phẩm</Link> → bấm &quot;Tạo bài đăng&quot;.
        </p>
      ) : (
        <div className="mt-6 space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.image_url ? (
                  <Image src={p.image_url} alt="" fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-semibold">
                  {p.product?.name ?? "(không gắn sản phẩm)"}
                </p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {p.caption?.replace(/\n/g, " ") || "(chưa có caption)"}
                </p>
              </div>

              <div className="hidden sm:block">{statusBadge(p.status)}</div>

              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/bai-dang/${p.id}`}>
                  <Pencil className="size-3.5" /> Mở
                </Link>
              </Button>
              <DeleteProductButton
                id={p.id}
                action={deletePostAction}
                confirmText="Xóa bài đăng này?"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
