import { NextRequest, NextResponse } from "next/server";

import { sendMessage, answerCallback, type InlineButton } from "@/lib/telegram";
import { getTrendingProducts } from "@/lib/products";
import { adminGetProduct } from "@/lib/admin-products";
import { adminGetPost } from "@/lib/posts";
import { generateCaption } from "@/lib/caption";
import { publishToFacebook } from "@/lib/facebook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatPriceVND } from "@/lib/format";

export const dynamic = "force-dynamic";

function authorized(chatId: number | string): boolean {
  const allow = process.env.TELEGRAM_ADMIN_CHAT_ID;
  return !allow || String(chatId) === String(allow);
}

const WELCOME = `🤖 <b>Bot Đồ Xịn Nhà Xinh</b>
Ra lệnh đăng bài fanpage ngay từ đây.

<b>Lệnh:</b>
/hot — sản phẩm được quan tâm nhất → tạo bài đăng
/help — hướng dẫn

Mẹo: gõ "<i>đăng gì hôm nay</i>" cũng được.`;

/* eslint-disable @typescript-eslint/no-explicit-any */

async function showHot(chatId: number | string) {
  const products = await getTrendingProducts(8);
  if (products.length === 0) {
    await sendMessage(chatId, "Chưa có sản phẩm nào.");
    return;
  }
  const buttons: InlineButton[][] = products.map((p, i) => [
    {
      text: `${i + 1}. ${p.name.slice(0, 45)}${p.clicks > 0 ? ` (${p.clicks}👀)` : ""}`,
      callback_data: `taobai:${p.id}`,
    },
  ]);
  await sendMessage(
    chatId,
    "🔥 <b>Sản phẩm hot</b> — bấm để Claude viết bài đăng:",
    buttons,
  );
}

async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  if (!chatId) return;
  if (!authorized(chatId)) {
    await sendMessage(chatId, `⛔ Không có quyền. Chat ID của bạn: ${chatId}`);
    return;
  }
  const text: string = (msg.text || "").trim().toLowerCase();

  if (text.startsWith("/id")) {
    await sendMessage(chatId, `Chat ID của bạn: <code>${chatId}</code>`);
    return;
  }
  if (text.startsWith("/start") || text.startsWith("/help") || text === "/menu") {
    await sendMessage(chatId, WELCOME);
    return;
  }
  if (
    text.startsWith("/hot") ||
    text.includes("hot") ||
    text.includes("đăng gì") ||
    text.includes("hôm nay")
  ) {
    await showHot(chatId);
    return;
  }
  await sendMessage(chatId, "Chưa hiểu lệnh. Gõ /help hoặc /hot nhé.");
}

async function handleCallback(cq: any) {
  const chatId = cq.message?.chat?.id;
  const data: string = cq.data || "";
  await answerCallback(cq.id);
  if (!chatId || !authorized(chatId)) return;

  const sb = createSupabaseAdminClient();

  // Tạo bài: Claude viết caption -> lưu post -> gửi caption + nút Đăng/Hủy
  if (data.startsWith("taobai:")) {
    const productId = data.slice("taobai:".length);
    const product = await adminGetProduct(productId);
    if (!product) {
      await sendMessage(chatId, "Không tìm thấy sản phẩm.");
      return;
    }
    await sendMessage(chatId, "✍️ Đang viết caption...");
    let caption = "";
    let error: string | null = null;
    try {
      caption = await generateCaption(product);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
    const { data: post } = await sb
      .from("posts")
      .insert({
        product_id: product.id,
        caption,
        image_url: product.image_url,
        affiliate_url: product.affiliate_url,
        status: "draft",
        channel: "facebook",
        created_by: "agent",
        error,
      })
      .select("id")
      .single();

    if (error || !post) {
      await sendMessage(chatId, `❌ Lỗi viết caption: ${error || "không lưu được"}`);
      return;
    }
    await sendMessage(
      chatId,
      `📝 <b>Bản nháp:</b>\n\n${caption}\n\n${product.price > 0 ? formatPriceVND(product.price) : ""}`,
      [
        [
          { text: "✅ Đăng fanpage", callback_data: `dang:${post.id}` },
          { text: "❌ Hủy", callback_data: `huy:${post.id}` },
        ],
      ],
    );
    return;
  }

  // Đăng lên Facebook
  if (data.startsWith("dang:")) {
    const postId = data.slice("dang:".length);
    const post = await adminGetPost(postId);
    if (!post) return;
    await sendMessage(chatId, "📤 Đang đăng lên fanpage...");
    try {
      const { fbPostId } = await publishToFacebook({
        caption: post.caption || "",
        imageUrl: post.image_url,
        affiliateUrl: post.affiliate_url,
      });
      await sb
        .from("posts")
        .update({
          status: "published",
          fb_post_id: fbPostId,
          published_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", postId);
      await sendMessage(
        chatId,
        `✅ Đã đăng!\nhttps://facebook.com/${fbPostId}`,
      );
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      await sb.from("posts").update({ status: "failed", error: m }).eq("id", postId);
      await sendMessage(chatId, `❌ Đăng lỗi: ${m}`);
    }
    return;
  }

  // Hủy bản nháp
  if (data.startsWith("huy:")) {
    const postId = data.slice("huy:".length);
    await sb.from("posts").delete().eq("id", postId);
    await sendMessage(chatId, "🗑️ Đã hủy bản nháp.");
    return;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (
    secret &&
    req.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  try {
    if (update?.message) await handleMessage(update.message);
    else if (update?.callback_query) await handleCallback(update.callback_query);
  } catch (e) {
    console.error("telegram error", e);
  }
  // Luôn trả 200 để Telegram không gửi lại liên tục.
  return NextResponse.json({ ok: true });
}
