import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { buildAffiliateLink, parseShopeeIds } from "@/lib/shopee-link";
import { sendMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/**
 * Nhận "ứng viên hàng xu hướng" từ userscript đọc DOM trang Shopee (top-sale,
 * search bán chạy, danh mục...). Mỗi item là 1 link sản phẩm Shopee.
 * Server tạo sản phẩm DRAFT (source='trending') + link affiliate, chống trùng
 * theo shopee_item_id. Ảnh/giá để trống — bổ sung sau bằng userscript media (🐱).
 *
 *  POST ?key=SECRET  body { items: [{ url, name? }] }  → { added, skipped }
 *
 * Đọc DOM nên KHÔNG đụng anti-bot API. Bảo vệ bằng MEDIA_INGEST_SECRET.
 */

function authed(req: NextRequest): boolean {
  const secret = process.env.MEDIA_INGEST_SECRET;
  if (!secret) return false;
  const key =
    new URL(req.url).searchParams.get("key") || req.headers.get("x-ingest-key");
  return key === secret;
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type Candidate = { url: string; name?: string };

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const items: Candidate[] = body?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "items rỗng" }, { status: 400 });
  }
  const sb = createSupabaseAdminClient();

  // Lấy trước các item_id đã có để chống trùng.
  const { data: existing } = await sb
    .from("products")
    .select("shopee_item_id")
    .not("shopee_item_id", "is", null);
  const have = new Set((existing || []).map((r) => r.shopee_item_id));

  let added = 0;
  let skipped = 0;
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const ids = parseShopeeIds(it.url || "");
    if (!ids) {
      skipped++;
      continue;
    }
    if (have.has(ids.itemId) || seen.has(ids.itemId)) {
      skipped++;
      continue;
    }
    seen.add(ids.itemId);

    // Tên: ưu tiên tên DOM gửi lên; nếu trống thì tách từ slug trong URL.
    let name = (it.name || "").trim();
    if (!name) {
      const m = it.url.match(/shopee\.vn\/([^?]*?)-i\.\d+\.\d+/i);
      if (m && m[1]) {
        try {
          name = decodeURIComponent(m[1]).replace(/-/g, " ").trim();
        } catch {
          /* noop */
        }
      }
    }
    name = (name || "Sản phẩm Shopee").slice(0, 200);
    const slug = `sp-${ids.itemId}`;

    let affiliate: string;
    try {
      affiliate = buildAffiliateLink(it.url, { subId: slug });
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
      continue;
    }

    const { error } = await sb.from("products").insert({
      name,
      slug,
      price: 0,
      affiliate_url: affiliate,
      shopee_item_id: ids.itemId,
      shopee_shop_id: ids.shopId,
      source: "trending",
      status: "draft",
    });
    if (error) {
      // 23505 = trùng unique → coi như skip
      if ((error as { code?: string }).code === "23505") skipped++;
      else errors.push(`${slug}: ${error.message}`);
    } else {
      added++;
      have.add(ids.itemId);
    }
  }

  // Tự báo về bot khi có hàng mới (khép vòng — anh khỏi tự kiểm).
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (added > 0 && chat) {
    try {
      await sendMessage(
        chat,
        `🔥 Đã nhận <b>${added}</b> hàng mới về kho (bỏ qua ${skipped} trùng).\n` +
          `Gõ /duyet để xem + tạo bài. Nhớ bấm 🐱 lấy ảnh+video cho hàng mới.`,
      );
    } catch {
      /* không chặn response nếu báo bot lỗi */
    }
  }

  return NextResponse.json({ ok: true, added, skipped, errors });
}
