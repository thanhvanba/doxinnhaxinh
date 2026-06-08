import { createSupabaseAdminClient } from "./supabase/admin";

/** Hàng sản phẩm cho admin (mọi trạng thái, gồm cả nháp). */
export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  discount: number | null;
  image_url: string | null;
  affiliate_url: string;
  badge: string | null;
  sold: number | null;
  category_id: string | null;
  status: string;
  is_featured: boolean;
  is_flash_deal: boolean;
};

const COLS =
  "id,slug,name,price,original_price,discount,image_url,affiliate_url,badge,sold,category_id,status,is_featured,is_flash_deal";

/** Tất cả sản phẩm (admin) — gồm nháp/chờ duyệt. */
export async function adminGetProducts(): Promise<AdminProduct[]> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

/** Một sản phẩm theo id (admin). */
export async function adminGetProduct(id: string): Promise<AdminProduct | null> {
  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as AdminProduct) ?? null;
}
