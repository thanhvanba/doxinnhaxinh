import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Nhận media (ảnh + video) của sản phẩm từ userscript Tampermonkey chạy trong
 * trình duyệt Shopee đã login (qua được anti-bot). Server chỉ lo việc resolve
 * shopid/itemid (theo redirect 301, KHÔNG bị chặn) và lưu DB.
 *
 *  GET  ?key=SECRET           → trả danh sách SP thiếu media + shopid/itemid
 *  POST ?key=SECRET {items[]} → lưu images[] / video_url / giá ... vào DB
 *
 * Bảo vệ bằng MEDIA_INGEST_SECRET. Userscript giữ secret này (chạy ở máy anh).
 */

function authed(req: NextRequest): boolean {
  const secret = process.env.MEDIA_INGEST_SECRET;
  if (!secret) return false;
  const key =
    new URL(req.url).searchParams.get("key") ||
    req.headers.get("x-ingest-key");
  return key === secret;
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

function parseIds(url: string): { shopid: string; itemid: string } | null {
  const m =
    url.match(/\/opaanlp\/(\d+)\/(\d+)/) ||
    url.match(/-i\.(\d+)\.(\d+)/) ||
    url.match(/\/product\/(\d+)\/(\d+)/);
  return m ? { shopid: m[1], itemid: m[2] } : null;
}

/** Theo redirect để lấy shopid/itemid (server làm được, không đụng data SP). */
async function resolveIds(
  affiliateUrl: string,
): Promise<{ shopid: string; itemid: string } | null> {
  let cur = affiliateUrl;
  for (let i = 0; i < 6; i++) {
    const here = parseIds(cur);
    if (here) return here;
    const res = await fetch(cur, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": UA },
    }).catch(() => null);
    if (!res) return parseIds(cur);
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      cur = loc.startsWith("http") ? loc : new URL(loc, cur).toString();
      const got = parseIds(cur);
      if (got) return got;
      continue;
    }
    return parseIds(cur);
  }
  return parseIds(cur);
}

type PendingRow = {
  id: string;
  slug: string;
  affiliate_url: string;
  shopee_shop_id: string | null;
  shopee_item_id: string | null;
  images: string[] | null;
  video_url: string | null;
};

export async function GET(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const sb = createSupabaseAdminClient();

  const { data, error } = await sb
    .from("products")
    .select("id,slug,affiliate_url,shopee_shop_id,shopee_item_id,images,video_url")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // Thiếu media = chưa có gallery ảnh HOẶC chưa có video.
  const rows = (data as PendingRow[]).filter(
    (p) => !(p.images && p.images.length) || !p.video_url,
  );

  const pending: { id: string; slug: string; shopid: string; itemid: string }[] = [];
  for (const p of rows) {
    let shopid = p.shopee_shop_id;
    let itemid = p.shopee_item_id;
    if (!shopid || !itemid) {
      const ids = await resolveIds(p.affiliate_url);
      if (!ids) continue;
      shopid = ids.shopid;
      itemid = ids.itemid;
      // Lưu lại để lần sau khỏi resolve.
      await sb
        .from("products")
        .update({ shopee_shop_id: shopid, shopee_item_id: itemid })
        .eq("id", p.id);
    }
    pending.push({ id: p.id, slug: p.slug, shopid, itemid });
  }

  return NextResponse.json({ ok: true, count: pending.length, pending });
}

type IngestItem = {
  id?: string;
  slug?: string;
  images?: string[];
  video_url?: string | null;
  name?: string;
  price?: number;
  original_price?: number;
  discount?: number;
  sold?: number;
};

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => null);
  const items: IngestItem[] = body?.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ ok: false, error: "items rỗng" }, { status: 400 });
  }
  const sb = createSupabaseAdminClient();

  let updated = 0;
  const errors: string[] = [];
  for (const it of items) {
    const patch: Record<string, unknown> = {};
    if (Array.isArray(it.images) && it.images.length) {
      patch.images = it.images;
      patch.image_url = it.images[0]; // ảnh đại diện = ảnh đầu
    }
    if (it.video_url) patch.video_url = it.video_url;
    if (it.name) patch.name = it.name;
    if (typeof it.price === "number" && it.price > 0) patch.price = it.price;
    if (typeof it.original_price === "number" && it.original_price > 0)
      patch.original_price = it.original_price;
    if (typeof it.discount === "number" && it.discount > 0) patch.discount = it.discount;
    if (typeof it.sold === "number" && it.sold >= 0) patch.sold = it.sold;

    if (Object.keys(patch).length === 0) continue;

    const q = sb.from("products").update(patch).select("id");
    const { data, error } = it.id
      ? await q.eq("id", it.id)
      : await q.eq("slug", it.slug || "");
    if (error) errors.push(`${it.slug || it.id}: ${error.message}`);
    else if (data && data.length) updated += data.length;
    else errors.push(`${it.slug || it.id}: không tìm thấy sản phẩm`);
  }

  return NextResponse.json({ ok: true, updated, errors });
}
