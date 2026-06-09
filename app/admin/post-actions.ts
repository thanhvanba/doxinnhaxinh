"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { adminGetProduct } from "@/lib/admin-products";
import { adminGetPost } from "@/lib/posts";
import { generateCaption } from "@/lib/caption";
import { publishToFacebook } from "@/lib/facebook";
import { isAuthed } from "@/lib/auth";

async function guard() {
  if (!(await isAuthed())) redirect("/admin/login");
}

/** Tạo bài đăng từ 1 sản phẩm: AI viết caption -> lưu draft -> mở trang sửa. */
export async function createPostFromProductAction(formData: FormData) {
  await guard();
  const productId = String(formData.get("product_id") || "");
  if (!productId) redirect("/admin/san-pham");

  const product = await adminGetProduct(productId);
  if (!product) redirect("/admin/san-pham");

  let caption = "";
  let error: string | null = null;
  try {
    caption = await generateCaption(product);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const sb = createSupabaseAdminClient();
  const { data, error: insErr } = await sb
    .from("posts")
    .insert({
      product_id: product.id,
      caption,
      image_url: product.image_url,
      images: product.images ?? [],
      video_url: product.video_url,
      affiliate_url: product.affiliate_url,
      status: "draft",
      channel: "facebook",
      created_by: "agent",
      error,
    })
    .select("id")
    .single();
  if (insErr) throw insErr;

  redirect(`/admin/bai-dang/${data.id}`);
}

/** Viết lại caption bằng Claude. */
export async function regenerateCaptionAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const post = await adminGetPost(id);
  if (!post?.product_id) redirect(`/admin/bai-dang/${id}`);

  const product = await adminGetProduct(post.product_id);
  if (!product) redirect(`/admin/bai-dang/${id}`);

  const sb = createSupabaseAdminClient();
  try {
    const caption = await generateCaption(product);
    await sb.from("posts").update({ caption, error: null }).eq("id", id);
  } catch (e) {
    await sb
      .from("posts")
      .update({ error: e instanceof Error ? e.message : String(e) })
      .eq("id", id);
  }
  redirect(`/admin/bai-dang/${id}`);
}

/** Lưu caption + trạng thái (sửa tay / duyệt). */
export async function savePostAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const caption = String(formData.get("caption") || "");
  const status = String(formData.get("status") || "draft");
  const sb = createSupabaseAdminClient();
  const { error } = await sb
    .from("posts")
    .update({ caption, status })
    .eq("id", id);
  if (error) throw error;
  redirect("/admin/bai-dang");
}

/** Đăng lên Facebook. */
export async function publishPostAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const post = await adminGetPost(id);
  if (!post) redirect("/admin/bai-dang");

  const sb = createSupabaseAdminClient();
  try {
    const { fbPostId } = await publishToFacebook({
      caption: post.caption || "",
      imageUrl: post.image_url,
      images: post.images,
      videoUrl: post.video_url,
      affiliateUrl: post.affiliate_url,
    });
    await sb
      .from("posts")
      .update({
        status: "published",
        fb_post_id: fbPostId,
        error: null,
        published_at: new Date().toISOString(),
      })
      .eq("id", id);
  } catch (e) {
    await sb
      .from("posts")
      .update({
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      })
      .eq("id", id);
  }
  revalidatePath("/admin/bai-dang");
  redirect(`/admin/bai-dang/${id}`);
}

export async function deletePostAction(formData: FormData) {
  await guard();
  const id = String(formData.get("id") || "");
  const sb = createSupabaseAdminClient();
  await sb.from("posts").delete().eq("id", id);
  redirect("/admin/bai-dang");
}
