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

type Candidate = {
  url: string;
  name?: string;
  image?: string; // 1 thumbnail (quét trang danh sách 🔥)
  images?: string[]; // full gallery (quét trang sản phẩm PDP 🖼️)
  video?: string;
  full?: boolean; // true = quét PDP → đè full gallery + video kể cả SP đã có ảnh
};

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const items: Candidate[] = body?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "items rỗng" }, { status: 400 });
  }
  const sb = createSupabaseAdminClient();

  // SP đã có (theo item_id) + tình trạng ảnh → để chống trùng + backfill ảnh.
  const { data: existing } = await sb
    .from("products")
    .select("id,shopee_item_id,image_url")
    .not("shopee_item_id", "is", null);
  const existMap = new Map(
    (existing || []).map((r) => [r.shopee_item_id, { id: r.id, hasImage: !!r.image_url }]),
  );

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const ids = parseShopeeIds(it.url || "");
    if (!ids) {
      skipped++;
      continue;
    }
    if (seen.has(ids.itemId)) {
      skipped++;
      continue;
    }
    seen.add(ids.itemId);

    const gallery = (Array.isArray(it.images) && it.images.length ? it.images : [])
      .map((s) => (s || "").trim())
      .filter(Boolean);
    const img0 = (it.image || "").trim();
    const imgs = gallery.length ? gallery : img0 ? [img0] : [];
    const vid0 = (it.video || "").trim();

    // Đã có sẵn:
    //  - quét PDP (full): đè full gallery + video, kể cả khi đã có ảnh.
    //  - quét danh sách: chỉ bù thumbnail khi đang thiếu ảnh.
    const ex = existMap.get(ids.itemId);
    if (ex) {
      const doFull = it.full && (imgs.length > 0 || vid0);
      const doBackfill = !ex.hasImage && imgs.length > 0;
      const patch: Record<string, unknown> = {};
      if (doFull || doBackfill) {
        if (imgs.length) {
          patch.image_url = imgs[0];
          patch.images = imgs;
        }
        if (vid0) patch.video_url = vid0;
      }
      if (Object.keys(patch).length) {
        const { error } = await sb.from("products").update(patch).eq("id", ex.id);
        if (error) errors.push(`${ids.itemId}: ${error.message}`);
        else updated++;
      } else {
        skipped++;
      }
      continue;
    }

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
      image_url: imgs[0] || null,
      images: imgs,
      video_url: vid0 || null,
      source: "trending",
      status: "draft",
    });
    if (error) {
      // 23505 = trùng unique → coi như skip
      if ((error as { code?: string }).code === "23505") skipped++;
      else errors.push(`${slug}: ${error.message}`);
    } else {
      added++;
      existMap.set(ids.itemId, { id: 0, hasImage: imgs.length > 0 });
    }
  }

  // Tự báo về bot khi có hàng mới (khép vòng — anh khỏi tự kiểm).
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if ((added > 0 || updated > 0) && chat) {
    try {
      await sendMessage(
        chat,
        `🔥 Hàng mới: <b>${added}</b> · bổ sung ảnh: <b>${updated}</b> (bỏ qua ${skipped} trùng).\n` +
          `Gõ /duyet để xem + tạo bài.`,
      );
    } catch {
      /* không chặn response nếu báo bot lỗi */
    }
  }

  return NextResponse.json({ ok: true, added, updated, skipped, errors });
}
