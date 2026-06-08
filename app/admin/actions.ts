"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPassword, setSession, clearSession, isAuthed } from "@/lib/auth";
import { buildAffiliateLink } from "@/lib/shopee-link";

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

  let image_url = String(formData.get("current_image") || "") || null;
  const file = formData.get("image");
  if (file && typeof file === "object" && "arrayBuffer" in file) {
    const f = file as File;
    if (f.size > 0) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const rand = Math.random().toString(36).slice(2, 8);
      const path = `${slug || Date.now()}-${rand}.${ext}`;
      const buf = Buffer.from(await f.arrayBuffer());
      const { error: upErr } = await sb.storage
        .from("products")
        .upload(path, buf, { contentType: f.type || "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      image_url = sb.storage.from("products").getPublicUrl(path).data.publicUrl;
    }
  }

  const row = {
    name,
    slug,
    price: numOrNull(formData, "price") ?? 0,
    original_price: numOrNull(formData, "original_price"),
    discount: numOrNull(formData, "discount"),
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

export async function deleteProductAction(formData: FormData) {
  if (!(await isAuthed())) redirect("/admin/login");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/san-pham");
  const sb = createSupabaseAdminClient();
  const { error } = await sb.from("products").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/", "layout");
  redirect("/admin/san-pham");
}
