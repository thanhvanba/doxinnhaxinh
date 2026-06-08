"use client";

import { Trash2 } from "lucide-react";

export function DeleteProductButton({
  id,
  action,
  confirmText = "Xóa mục này? Không thể hoàn tác.",
}: {
  id: string;
  action: (formData: FormData) => void;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        aria-label="Xóa"
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </button>
    </form>
  );
}
