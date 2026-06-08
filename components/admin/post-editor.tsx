"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles, Send } from "lucide-react";

import type { Post } from "@/lib/posts";
import {
  savePostAction,
  regenerateCaptionAction,
  publishPostAction,
} from "@/app/admin/post-actions";
import { Button } from "@/components/ui/button";

export function PostEditor({ post }: { post: Post }) {
  const published = post.status === "published";

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/bai-dang"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Quay lại danh sách
      </Link>

      <h1 className="mt-4 font-display text-2xl font-extrabold">Bài đăng</h1>
      <p className="text-sm text-muted-foreground">
        {post.product?.name ?? "(không gắn sản phẩm)"}
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[160px_1fr]">
        <div>
          {post.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.image_url}
              alt=""
              className="aspect-square w-full rounded-xl border object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
              Chưa có ảnh
            </div>
          )}
          {post.affiliate_url && (
            <p className="mt-2 break-all text-xs text-muted-foreground">
              🔗 {post.affiliate_url}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {post.error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {post.error}
            </p>
          )}

          {/* Sửa caption + trạng thái */}
          <form action={savePostAction} className="space-y-3">
            <input type="hidden" name="id" value={post.id} />
            <textarea
              name="caption"
              rows={10}
              defaultValue={post.caption ?? ""}
              placeholder="Nội dung bài đăng..."
              className="w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            <div className="flex items-center gap-3">
              <select
                name="status"
                defaultValue={post.status}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value="draft">Nháp</option>
                <option value="approved">Đã duyệt</option>
              </select>
              <Button type="submit" variant="outline" size="sm">
                Lưu
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-3 border-t pt-4">
            {/* Viết lại caption */}
            <form action={regenerateCaptionAction}>
              <input type="hidden" name="id" value={post.id} />
              <Button type="submit" variant="secondary" size="sm">
                <Sparkles className="size-4" /> Viết lại caption (AI)
              </Button>
            </form>

            {/* Đăng Facebook */}
            <form
              action={publishPostAction}
              onSubmit={(e) => {
                if (!confirm("Đăng bài này lên fanpage Facebook ngay?"))
                  e.preventDefault();
              }}
            >
              <input type="hidden" name="id" value={post.id} />
              <Button type="submit" size="sm" className="font-semibold" disabled={published}>
                <Send className="size-4" />
                {published ? "Đã đăng" : "Đăng lên Facebook"}
              </Button>
            </form>
          </div>

          {published && post.fb_post_id && (
            <a
              href={`https://facebook.com/${post.fb_post_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              Xem bài trên Facebook ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
