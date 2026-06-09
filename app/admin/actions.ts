"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, setSession, clearSession, isAuthed } from "@/lib/auth";
import { buildAffiliateLink, parseShopeeIds } from "@/lib/shopee-link";

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function numOrNull(fd: FormData, key: string): number | null {
  const v = fd.get(key);
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function loginAction(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (!verifyPassword(pw)) redirect("/admin/login?error=1");
  await setSession();
  redirect("/admin/san-pham");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export async function saveProductAction(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const sb = createSupabaseAdminClient();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  let slug = String(formData.get("slug") || "").trim();
  if (!slug) slug = slugify(name);

  // Link affiliate: ưu tiên link đã nhập sẵn; nếu trống mà có "link sản phẩm gốc"
  // → tự ghép link affiliate bằng công thức an_redir (sub_id = slug để đếm click).
  let affiliate_url = String(formData.get("affiliate_url") || "").trim();
  const original_url = String(formData.get("original_url") || "").trim();
  if (!affiliate_url && original_url) {
    affiliate_url = buildAffiliateLink(original_url, { subId: slug });
  }
  if (!affiliate_url) {
    throw new Error("Cần nhập Link sản phẩm gốc (Shopee) HOẶC Link affiliate.");
  }

  // item_id Shopee: ưu tiên nhập tay; nếu trống thì tách từ link gốc (đuôi -i.{shop}.{item}).
  let shopee_item_id = String(formData.get("shopee_item_id") || "").trim() || null;
  if (!shopee_item_id && original_url) {
    shopee_item_id = parseShopeeIds(original_url)?.itemId ?? null;
  }

  // Gallery: giữ ảnh cũ (current_images = JSON) + nối thêm ảnh mới tải lên.
  let images: string[] = [];
  const currentImages = String(formData.get("current_images") || "");
  if (currentImages) {
    try {
      const parsed = JSON.parse(currentImages);
      if (Array.isArray(parsed)) images = parsed.filter((u) => typeof u === "string");
    } catch {
      /* bỏ qua JSON hỏng */
    }
  }
  const files = formData
    .getAll("images")
    .filter((f): f is File => typeof f === "object" && "arrayBuffer" in f && f.size > 0);
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${slug || Date.now()}-${rand}-${i}.${ext}`;
    const buf = Buffer.from(await f.arrayBuffer());
    const { error: upErr } = await sb.storage
      .from("products")
      .upload(path, buf, { contentType: f.type || "image/jpeg", upsert: true });
    if (upErr) throw upErr;
    images.push(sb.storage.from("products").getPublicUrl(path).data.publicUrl);
  }
  const image_url = images[0] ?? null; // ảnh đại diện = ảnh đầu

  const row = {
    name,
    slug,
    price: numOrNull(formData, "price") ?? 0,
    original_price: numOrNull(formData, "original_price"),
    discount: numOrNull(formData, "discount"),
    shopee_item_id,
    images,
    image_url,
    affiliate_url,
    badge: String(formData.get("badge") || "").trim() || null,
    sold: numOrNull(formData, "sold") ?? 0,
    category_id: String(formData.get("category_id") || "") || null,
    status: String(formData.get("status") || "draft"),
    is_featured: formData.get("is_featured") === "on",
    is_flash_deal: formData.get("is_flash_deal") === "on",
  };

  if (id) {
    const { error } = await sb.from("products").update(row).eq("id", id);
    if (error) throw error;
  } else {
    const { error } = await sb.from("products").insert(row);
    if (error) throw error;
  }

  revalidatePath("/", "layout");
  redirect("/admin/san-pham");
}

/** Xóa MỀM: chuyển sang 'archived' + đánh dấu deleted_at → vào Thùng rác, khôi phục được. */
export async function deleteProductAction(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/san-pham");
  const sb = createSupabaseAdminClient();
  const { error } = await sb
    .from("products")
    .update({ status: "archived", deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect("/admin/san-pham");
}

/** Khôi phục từ Thùng rác về 'draft'. */
export async function restoreProductAction(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/san-pham");
  const sb = createSupabaseAdminClient();
  const { error } = await sb
    .from("products")
    .update({ status: "draft", deleted_at: null })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect("/admin/san-pham?status=archived");
}

/** Thao tác hàng loạt trên nhiều SP. action ∈ approve|publish|archive|restore|move. */
export async function bulkProductAction(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const ids = String(formData.get("ids") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const action = String(formData.get("action") || "");
  const value = String(formData.get("value") || ""); // category_id khi move
  const returnTo = String(formData.get("returnTo") || "/admin/san-pham");
  if (ids.length === 0) redirect(returnTo);

  let patch: Record<string, unknown>;
  switch (action) {
    case "approve":
      patch = { status: "approved" };
      break;
    case "publish":
      patch = { status: "published" };
      break;
    case "archive":
      patch = { status: "archived", deleted_at: new Date().toISOString() };
      break;
    case "restore":
      patch = { status: "draft", deleted_at: null };
      break;
    case "move":
      patch = { category_id: value || null };
      break;
    default:
      redirect(returnTo);
  }

  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("products").update(patch).in("id", ids);
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect(returnTo);
}
