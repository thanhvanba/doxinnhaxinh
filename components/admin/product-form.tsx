import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { AdminProduct } from "@/lib/admin-products";
import type { CategoryRow } from "@/lib/products";
import { saveProductAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const labelCls = "mb-1.5 block text-sm font-medium";
const selectCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function ProductForm({
  product,
  categories,
}: {
  product: AdminProduct | null;
  categories: CategoryRow[];
}) {
  const isNew = !product;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/san-pham"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" /> Quay lại danh sách
      </Link>

      <h1 className="mt-4 font-display text-2xl font-extrabold">
        {isNew ? "Thêm sản phẩm" : "Sửa sản phẩm"}
      </h1>

      <form
        action={saveProductAction}
        className="mt-6 space-y-5 rounded-2xl border bg-card p-6 shadow-sm"
      >
        {product && <input type="hidden" name="id" value={product.id} />}
        <input
          type="hidden"
          name="current_image"
          defaultValue={product?.image_url ?? ""}
        />

        <div>
          <label className={labelCls}>Tên sản phẩm *</label>
          <Input name="name" required defaultValue={product?.name ?? ""} />
        </div>

        <div>
          <label className={labelCls}>Link sản phẩm Shopee (gốc)</label>
          <Input
            name="original_url"
            placeholder="https://shopee.vn/...-i.123.456  (dán link sản phẩm bình thường)"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Dán link sản phẩm gốc → hệ thống tự tạo link affiliate (kèm tracking).
            Bỏ trống nếu bạn tự nhập link affiliate bên dưới.
          </p>
        </div>

        <div>
          <label className={labelCls}>
            Link affiliate {isNew ? "(để trống = tự tạo từ link gốc)" : ""}
          </label>
          <Input
            name="affiliate_url"
            placeholder="Tự tạo từ link gốc — hoặc dán link s.shopee.vn nếu có sẵn"
            defaultValue={product?.affiliate_url ?? ""}
          />
        </div>

        <div>
          <label className={labelCls}>Slug (để trống = tự tạo từ tên)</label>
          <Input name="slug" defaultValue={product?.slug ?? ""} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Giá (VND)</label>
            <Input
              name="price"
              type="number"
              min="0"
              defaultValue={product?.price ?? ""}
            />
          </div>
          <div>
            <label className={labelCls}>Giá gốc (VND)</label>
            <Input
              name="original_price"
              type="number"
              min="0"
              defaultValue={product?.original_price ?? ""}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Giảm giá (%)</label>
            <Input
              name="discount"
              type="number"
              min="0"
              max="100"
              defaultValue={product?.discount ?? ""}
            />
          </div>
          <div>
            <label className={labelCls}>Đã bán</label>
            <Input
              name="sold"
              type="number"
              min="0"
              defaultValue={product?.sold ?? ""}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Danh mục</label>
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className={selectCls}
          >
            <option value="">— Chưa phân loại —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Nhãn (badge)</label>
          <Input
            name="badge"
            placeholder="Best Seller / Hot Sale / Flash Sale..."
            defaultValue={product?.badge ?? ""}
          />
        </div>

        <div>
          <label className={labelCls}>Ảnh sản phẩm</label>
          {product?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt=""
              className="mb-2 size-28 rounded-lg border object-cover"
            />
          )}
          <input
            name="image"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Để trống nếu giữ ảnh cũ. Tải ảnh từ máy (tối đa 5MB).
          </p>
        </div>

        <div>
          <label className={labelCls}>Trạng thái</label>
          <select
            name="status"
            defaultValue={product?.status ?? "draft"}
            className={selectCls}
          >
            <option value="draft">Nháp</option>
            <option value="approved">Đã duyệt</option>
            <option value="published">Đã đăng (hiện trên web)</option>
          </select>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={product?.is_featured ?? false}
              className="size-4 accent-primary"
            />
            Nổi bật
          </label>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="is_flash_deal"
              defaultChecked={product?.is_flash_deal ?? false}
              className="size-4 accent-destructive"
            />
            Flash Sale
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="font-semibold">
            {isNew ? "Thêm sản phẩm" : "Lưu thay đổi"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/san-pham">Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
