import { createSupabaseServerClient } from "./supabase/server";
import type { Product } from "./types";

/** Hàng dữ liệu thô từ DB (snake_case). */
type DbProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  discount: number | null;
  rating: number | null;
  reviews: number | null;
  image_url: string | null;
  images: string[] | null;
  shopee_item_id: string | null;
  affiliate_url: string;
  badge: string | null;
  sold: number | null;
  clicks: number | null;
  category: { slug: string; name: string } | null;
};

/** Hàng danh mục thô từ DB. */
export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  product_count_label: string | null;
  discount_label: string | null;
  is_hot: boolean;
};

const COLS =
  "id,slug,name,price,original_price,discount,rating,reviews,image_url,images,shopee_item_id,affiliate_url,badge,sold,category:categories(slug,name)";

function toProduct(r: DbProduct): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: r.price,
    originalPrice: r.original_price ?? r.price,
    discount: r.discount ?? 0,
    rating: r.rating ?? 0,
    reviews: r.reviews ?? 0,
    image: r.image_url ?? r.images?.[0] ?? undefined,
    images: r.images ?? undefined,
    shopeeItemId: r.shopee_item_id ?? undefined,
    affiliateUrl: r.affiliate_url,
    badge: r.badge ?? undefined,
    sold: r.sold ?? 0,
    clicks: r.clicks ?? 0,
    categorySlug: r.category?.slug,
    categoryName: r.category?.name,
  };
}

/** Sản phẩm "hot" — nhiều lượt quan tâm (click) nhất.
 *  Trả [] nếu cột clicks chưa migrate (0004) — để web vẫn chạy. */
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select(`${COLS},clicks`)
    .eq("status", "published")
    .order("clicks", { ascending: false })
    .order("sold", { ascending: false })
    .limit(limit);
  if (error) return [];
  return ((data ?? []) as unknown as DbProduct[]).map(toProduct);
}

/** Sản phẩm nổi bật (is_featured), nhiều lượt bán trước. */
export async function getFeaturedProducts(limit = 24): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("sold", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as unknown as DbProduct[]).map(toProduct);
}

/** Sản phẩm flash sale (is_flash_deal), sắp hết hạn trước. */
export async function getFlashDeals(limit = 3): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("status", "published")
    .eq("is_flash_deal", true)
    .order("flash_deal_ends_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return ((data ?? []) as unknown as DbProduct[]).map(toProduct);
}

/** Toàn bộ sản phẩm đã publish. */
export async function getPublishedProducts(): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as DbProduct[]).map(toProduct);
}

/** Một danh mục theo slug. */
export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryRow | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("categories")
    .select("id,name,slug,icon,product_count_label,discount_label,is_hot")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as CategoryRow) ?? null;
}

/** Sản phẩm theo danh mục (cho trang /danh-muc/[slug]). */
export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const sb = createSupabaseServerClient();
  const cat = await getCategoryBySlug(categorySlug);
  if (!cat) return [];
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("status", "published")
    .eq("category_id", cat.id)
    .order("sold", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as DbProduct[]).map(toProduct);
}

/** Một sản phẩm theo slug (cho trang chi tiết). */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("products")
    .select(COLS)
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? toProduct(data as unknown as DbProduct) : null;
}

/** Một danh mục kèm danh sách sản phẩm của nó (cho các khối theo danh mục ở trang chủ). */
export type CategoryWithProducts = CategoryRow & { products: Product[] };

/** Các danh mục (theo sort_order) kèm tối đa `perCategory` sản phẩm mỗi danh mục.
 *  Chỉ trả về những danh mục đang có sản phẩm publish. */
export async function getCategoriesWithProducts(
  perCategory = 8,
): Promise<CategoryWithProducts[]> {
  const sb = createSupabaseServerClient();
  const [categories, productsRes] = await Promise.all([
    getCategories(),
    sb
      .from("products")
      .select(COLS)
      .eq("status", "published")
      .order("sold", { ascending: false }),
  ]);
  if (productsRes.error) throw productsRes.error;

  const products = ((productsRes.data ?? []) as unknown as DbProduct[]).map(
    toProduct,
  );

  // Gom sản phẩm theo slug danh mục.
  const bySlug = new Map<string, Product[]>();
  for (const p of products) {
    if (!p.categorySlug) continue;
    const list = bySlug.get(p.categorySlug) ?? [];
    if (list.length < perCategory) list.push(p);
    bySlug.set(p.categorySlug, list);
  }

  return categories
    .map((c) => ({ ...c, products: bySlug.get(c.slug) ?? [] }))
    .filter((c) => c.products.length > 0);
}

/** Danh sách danh mục (sắp theo sort_order). */
export async function getCategories(): Promise<CategoryRow[]> {
  const sb = createSupabaseServerClient();
  const { data, error } = await sb
    .from("categories")
    .select("id,name,slug,icon,product_count_label,discount_label,is_hot")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}
