import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { publishToFacebook } from "@/lib/facebook";
import { getTrendingProducts } from "@/lib/products";
import { sendMessage, type InlineButton } from "@/lib/telegram";

export const dynamic = "force-dynamic";

/** Đăng các bài đã hẹn giờ tới hạn (status=approved, scheduled_at <= now). */
async function publishDue(): Promise<number> {
  const sb = createSupabaseAdminClient();
  const { data: due } = await sb
    .from("posts")
    .select("id,caption,image_url,images,video_url,affiliate_url")
    .eq("status", "approved")
    .not("scheduled_at", "is", null)
    .lte("scheduled_at", new Date().toISOString())
    .limit(10);

  let published = 0;
  for (const p of due || []) {
    try {
      const { fbPostId } = await publishToFacebook({
        caption: p.caption || "",
        imageUrl: p.image_url,
        images: p.images,
        videoUrl: p.video_url,
        affiliateUrl: p.affiliate_url,
      });
      await sb
        .from("posts")
        .update({
          status: "published",
          fb_post_id: fbPostId,
          published_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", p.id);
      published++;
    } catch (e) {
      await sb
        .from("posts")
        .update({ status: "failed", error: e instanceof Error ? e.message : String(e) })
        .eq("id", p.id);
    }
  }
  return published;
}

/** Nhắc buổi sáng (~8h VN): gửi top sản phẩm hot kèm nút tạo bài. */
async function maybeRemind(): Promise<boolean> {
  const chat = process.env.TELEGRAM_ADMIN_CHAT_ID;
  if (!chat) return false;
  const vn = new Date(Date.now() + 7 * 3600 * 1000);
  if (vn.getUTCHours() !== 8 || vn.getUTCMinutes() >= 10) return false;

  const products = await getTrendingProducts(5);
  if (!products.length) return false;
  const buttons: InlineButton[][] = products.map((p, i) => [
    { text: `${i + 1}. ${p.name.slice(0, 40)}`, callback_data: `taobai:${p.id}` },
  ]);
  await sendMessage(
    chat,
    "🌅 <b>Chào buổi sáng!</b> Hôm nay đăng gì nào? Gợi ý sản phẩm hot:",
    buttons,
  );
  return true;
}

async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  const qs = new URL(req.url).searchParams.get("secret");
  if (secret && auth !== `Bearer ${secret}` && qs !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const published = await publishDue();
  const reminded = await maybeRemind();
  return NextResponse.json({ ok: true, published, reminded });
}

export async function GET(req: NextRequest) {
  return run(req);
}
export async function POST(req: NextRequest) {
  return run(req);
}
