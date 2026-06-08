// =============================================================================
//  Tạo link affiliate Shopee bằng CÔNG THỨC URL chính thức (an_redir).
//  KHÔNG cần API / cookie / trình duyệt — chạy thẳng server-side.
//
//  Tài liệu Shopee "Short Link Implementation Guideline":
//    https://{domain}/an_redir?origin_link={URL-encoded}&affiliate_id={id}&sub_id={...}
//  Khi click, Shopee tự thêm utm_source=an_{affiliate_id}, utm_medium=affiliates
//  → credit hoa hồng đúng. sub_id rơi vào utm_content → đếm click theo sản phẩm.
//
//  Đã test 2026-06-07: an_redir trên s.shopee.vn redirect 301 đúng, mang affiliate_id.
// =============================================================================

const SHORT_DOMAIN = "https://s.shopee.vn";

/** Lấy affiliate_id từ biến môi trường (đặt trong .env.local). */
function getAffiliateId(): string {
  const id = process.env.SHOPEE_AFFILIATE_ID;
  if (!id) {
    throw new Error(
      "Thiếu SHOPEE_AFFILIATE_ID trong .env.local (xem trong utm_source=an_XXXX của link affiliate)."
    );
  }
  return id;
}

/** Có phải URL sản phẩm Shopee hợp lệ không (chứa đuôi -i.{shopId}.{itemId}). */
export function isShopeeProductUrl(url: string): boolean {
  return /(?:^|\.)shopee\.vn\/.*i\.\d+\.\d+/.test(url) || /i\.\d+\.\d+/.test(url);
}

/** Tách { shopId, itemId } từ URL sản phẩm Shopee (đuôi -i.{shopId}.{itemId}). */
export function parseShopeeIds(url: string): { shopId: string; itemId: string } | null {
  const m = url.match(/i\.(\d+)\.(\d+)/);
  return m ? { shopId: m[1], itemId: m[2] } : null;
}

/**
 * Ghép link affiliate từ URL sản phẩm gốc.
 * @param originalUrl URL sản phẩm Shopee (vd https://shopee.vn/...-i.123.456)
 * @param opts.subId  nhãn tracking (nên dùng slug sản phẩm) → về utm_content
 * @param opts.affiliateId ghi đè affiliate_id (mặc định lấy từ env)
 */
export function buildAffiliateLink(
  originalUrl: string,
  opts: { subId?: string; affiliateId?: string } = {}
): string {
  const url = originalUrl.trim();
  if (!url) throw new Error("originalUrl rỗng");

  const affiliateId = opts.affiliateId || getAffiliateId();
  const params = new URLSearchParams();
  params.set("origin_link", url); // URLSearchParams tự encode
  params.set("affiliate_id", affiliateId);
  if (opts.subId) params.set("sub_id", opts.subId);

  return `${SHORT_DOMAIN}/an_redir?${params.toString()}`;
}
