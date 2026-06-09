"use client";

import { Check, Send, FolderInput, Trash2, RotateCcw, X } from "lucide-react";

import type { CategoryRow } from "@/lib/products";
import { Button } from "@/components/ui/button";

const selectCls =
  "h-8 rounded-md border border-input bg-background px-2 text-sm outline-none";

/** Thanh hành động hàng loạt — hiện khi đã chọn ≥1 SP. */
export function BulkBar({
  ids,
  categories,
  isTrash,
  returnTo,
  action,
  onClear,
}: {
  ids: string[];
  categories: CategoryRow[];
  isTrash: boolean;
  returnTo: string;
  action: (formData: FormData) => void;
  onClear: () => void;
}) {
  const idsStr = ids.join(",");

  // 1 nút = 1 form submit tới bulkProductAction.
  function ActionButton({
    act,
    children,
    variant = "secondary",
    confirmText,
  }: {
    act: string;
    children: React.ReactNode;
    variant?: "secondary" | "default" | "destructive" | "outline";
    confirmText?: string;
  }) {
    return (
      <form
        action={action}
        onSubmit={(e) => {
          if (confirmText && !confirm(confirmText)) e.preventDefault();
        }}
      >
        <input type="hidden" name="ids" value={idsStr} />
        <input type="hidden" name="action" value={act} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <Button type="submit" size="sm" variant={variant}>
          {children}
        </Button>
      </form>
    );
  }

  return (
    <div className="sticky bottom-4 z-20 mt-4">
      <div className="mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-lg">
        <span className="px-1 text-sm font-medium">
          Đã chọn <span className="text-primary">{ids.length}</span>
        </span>

        {isTrash ? (
          <ActionButton act="restore" variant="default">
            <RotateCcw className="size-3.5" /> Khôi phục
          </ActionButton>
        ) : (
          <>
            <ActionButton act="approve">
              <Check className="size-3.5" /> Duyệt
            </ActionButton>
            <ActionButton act="publish" variant="default">
              <Send className="size-3.5" /> Đăng
            </ActionButton>

            {/* Đổi danh mục: select + áp dụng */}
            <form action={action} className="flex items-center gap-1">
              <input type="hidden" name="ids" value={idsStr} />
              <input type="hidden" name="action" value="move" />
              <input type="hidden" name="returnTo" value={returnTo} />
              <FolderInput className="size-3.5 text-muted-foreground" />
              <select name="value" className={selectCls} defaultValue="">
                <option value="">Chưa phân loại</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline">
                Áp dụng
              </Button>
            </form>

            <ActionButton
              act="archive"
              variant="destructive"
              confirmText={`Chuyển ${ids.length} sản phẩm vào Thùng rác?`}
            >
              <Trash2 className="size-3.5" /> Xóa
            </ActionButton>
          </>
        )}

        <button
          type="button"
          onClick={onClear}
          aria-label="Bỏ chọn"
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
