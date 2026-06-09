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
  images: string[] | null;
  video_url: string | null;
  shopee_item_id: string | null;
  affiliate_url: string;
  badge: string | null;
  sold: number | null;
  category_id: string | null;
  status: string;
  is_featured: boolean;
  is_flash_deal: boolean;
  clicks: number | null;
  deleted_at: string | null;
};

const COLS =
  "id,slug,name,price,original_price,discount,image_url,images,video_url,shopee_item_id,affiliate_url,badge,sold,category_id,status,is_featured,is_flash_deal,clicks,deleted_at";

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

export type ProductSort = "new" | "hot" | "price_desc" | "price_asc";

/** Tham số lọc/tìm/sort/phân trang cho danh sách admin. */
export type ListParams = {
  q?: string; // tìm theo tên hoặc item_id
  cat?: string; // category_id | "none" (chưa phân loại) | "" (tất cả)
  status?: string; // draft|approved|published|archived | "" (tất cả TRỪ archived)
  featured?: boolean;
  missing?: boolean; // chỉ SP thiếu ảnh (image_url null)
  sort?: ProductSort;
  page?: number; // 1-based
  pageSize?: number; // 20|50|100
};

/** Bỏ ký tự dễ phá cú pháp .or()/.ilike của PostgREST. */
function sanitizeTerm(s: string): string {
  return s.replace(/[,()%*]/g, " ").trim();
}

/** Danh sách sản phẩm (admin) — lọc đa trục + phân trang server-side. */
export async function adminListProducts(
  p: ListParams,
): Promise<{ rows: AdminProduct[]; total: number }> {
  const sb = createSupabaseAdminClient();
  const page = Math.max(1, p.page ?? 1);
  const pageSize = p.pageSize ?? 15;
  const from = (page - 1) * pageSize;

  let qb = sb.from("products").select(COLS, { count: "exact" });

  // Trạng thái: rỗng = mọi thứ TRỪ archived; có giá trị = đúng trạng thái đó.
  if (p.status) qb = qb.eq("status", p.status);
  else qb = qb.neq("status", "archived");

  if (p.q) {
    const term = sanitizeTerm(p.q);
    if (term) qb = qb.or(`name.ilike.%${term}%,shopee_item_id.ilike.%${term}%`);
  }

  if (p.cat === "none") qb = qb.is("category_id", null);
  else if (p.cat) qb = qb.eq("category_id", p.cat);

  if (p.featured) qb = qb.eq("is_featured", true);
  if (p.missing) qb = qb.is("image_url", null);

  switch (p.sort) {
    case "hot":
      qb = qb.order("clicks", { ascending: false });
      break;
    case "price_desc":
      qb = qb.order("price", { ascending: false });
      break;
    case "price_asc":
      qb = qb.order("price", { ascending: true });
      break;
    default:
      qb = qb.order("created_at", { ascending: false });
  }

  const { data, error, count } = await qb.range(from, from + pageSize - 1);
  if (error) throw error;
  return { rows: (data ?? []) as AdminProduct[], total: count ?? 0 };
}

export type StatusCounts = {
  all: number;
  draft: number;
  approved: number;
  published: number;
  archived: number;
};

/** Đếm số SP theo trạng thái (cho tabs). "all" = mọi thứ TRỪ archived. */
export async function adminProductStatusCounts(): Promise<StatusCounts> {
  const sb = createSupabaseAdminClient();
  const count = async (status?: string): Promise<number> => {
    let qb = sb.from("products").select("*", { count: "exact", head: true });
    qb = status ? qb.eq("status", status) : qb.neq("status", "archived");
    const { count: c } = await qb;
    return c ?? 0;
  };
  const [all, draft, approved, published, archived] = await Promise.all([
    count(),
    count("draft"),
    count("approved"),
    count("published"),
    count("archived"),
  ]);
  return { all, draft, approved, published, archived };
}
