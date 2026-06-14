import { NextRequest, NextResponse } from "next/server";

import { sendMessage, answerCallback, type InlineButton } from "@/lib/telegram";
import { getTrendingProducts } from "@/lib/products";
import { adminGetProduct } from "@/lib/admin-products";
import { adminGetPost } from "@/lib/posts";
import { generateCaption } from "@/lib/caption";
import { publishToFacebook } from "@/lib/facebook";
import {
  chatAgent,
  type AgentAction,
  listMemories,
  saveMemory,
  deleteMemory,
} from "@/lib/agent";
import { listKeys, addKey, deleteKey, PROVIDER_PRESETS } from "@/lib/ai";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatPriceVND } from "@/lib/format";
import {
  isShopeeProductUrl,
  parseShopeeIds,
  buildAffiliateLink,
} from "@/lib/shopee-link";

export const dynamic = "force-dynamic";

function authorized(chatId: number | string): boolean {
  const allow = process.env.TELEGRAM_ADMIN_CHAT_ID;
  return !allow || String(chatId) === String(allow);
}

/** ISO của lần kế tiếp đạt mốc `hour`:00 giờ Việt Nam (UTC+7). */
function nextVnTime(hour: number): string {
  const now = Date.now();
  const vn = new Date(now + 7 * 3600 * 1000);
  let target =
    Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate(), hour) -
    7 * 3600 * 1000;
  if (target <= now) target += 24 * 3600 * 1000;
  return new Date(target).toISOString();
}

function fmtVn(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

const WELCOME = `🤖 <b>Bot Đồ Xịn Nhà Xinh</b>
Trợ lý đăng bài fanpage — ra lệnh từ đây.

<b>Lệnh:</b>
/hot — sản phẩm hot → tạo bài (đăng ngay / hẹn giờ)
/thongke — số liệu: click, bài đã đăng
/timhang — điều hướng tới trang Shopee hàng hot (bấm 🔥)
/duyet — hàng mới (draft) chờ duyệt → tạo bài
/nho — xem/xóa những điều em đang nhớ
/key — quản lý API key (thêm/xóa, tự xoay vòng)
/help — hướng dẫn

➕ Dán <b>link sản phẩm Shopee</b> → bot tự thêm vào kho.
💬 Cứ <b>nhắn tự nhiên</b> — hỏi gì, dặn gì, bảo đăng gì... em hiểu hết.
Mẹo: "đăng gì hôm nay", "tạo bài cho máy xay", "nhớ giùm anh đăng lúc 20h".`;

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
  await sendMessage(chatId, "🔥 <b>Sản phẩm hot</b> — bấm để AI viết bài:", buttons);
}

/** Hàng mới (draft) chờ duyệt — gồm hàng quét trending + dán link. */
async function showDrafts(chatId: number | string) {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("products")
    .select("id,name,source,image_url")
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(10);
  if (!data || data.length === 0) {
    await sendMessage(chatId, "Không có hàng nháp nào chờ duyệt. Dùng 🔥 userscript để quét hàng hot.");
    return;
  }
  const buttons: InlineButton[][] = data.map((p, i) => [
    {
      text: `${i + 1}. ${p.source === "trending" ? "🔥" : ""}${p.image_url ? "" : "📷"} ${p.name.slice(0, 40)}`,
      callback_data: `taobai:${p.id}`,
    },
  ]);
  await sendMessage(
    chatId,
    `📥 <b>${data.length} hàng nháp chờ duyệt</b> (🔥=trending · 📷=chưa có ảnh) — bấm để tạo bài:`,
    buttons,
  );
}

/** Điều hướng anh tới trang Shopee hàng hot + nhắc bấm 🔥 (bot không tự quét được). */
async function showFindGuide(chatId: number | string) {
  await sendMessage(
    chatId,
    `🧭 <b>Tìm hàng xu hướng</b>\n` +
      `Shopee chặn em quét tự động, nên anh mở 1 trong các trang sau (đã đăng nhập), ` +
      `bấm nút <b>🔥 Lấy hàng hot</b> rồi quay lại bấm /duyet để đăng:\n\n` +
      `🔥 <a href="https://shopee.vn/flash_sale">Flash Sale</a>\n` +
      `🏠 <a href="https://shopee.vn/search?keyword=đồ%20gia%20dụng&sortBy=sales">Đồ gia dụng bán chạy</a>\n` +
      `🛋️ <a href="https://shopee.vn/search?keyword=decor%20nhà&sortBy=sales">Decor nhà bán chạy</a>\n` +
      `🛏️ <a href="https://shopee.vn/search?keyword=nội%20thất&sortBy=sales">Nội thất bán chạy</a>\n\n` +
      `Mẹo: trang search nhớ chọn sắp xếp "<i>Bán chạy</i>" rồi mới bấm 🔥.`,
  );
}

async function showStats(chatId: number | string) {
  const sb = createSupabaseAdminClient();
  const now = Date.now();
  const vn = new Date(now + 7 * 3600 * 1000);
  const todayIso = new Date(
    Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate()) -
      7 * 3600 * 1000,
  ).toISOString();

  const [{ data: prods }, postsTotal, postsToday, sched] = await Promise.all([
    sb
      .from("products")
      .select("name,clicks")
      .eq("status", "published")
      .order("clicks", { ascending: false }),
    sb.from("posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    sb
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", todayIso),
    sb
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved")
      .not("scheduled_at", "is", null),
  ]);

  const totalClicks = (prods || []).reduce((s, p) => s + (p.clicks || 0), 0);
  const top = (prods || [])
    .filter((p) => (p.clicks || 0) > 0)
    .slice(0, 5)
    .map((p, i) => `${i + 1}. ${p.name.slice(0, 40)} — ${p.clicks}👀`)
    .join("\n");

  await sendMessage(
    chatId,
    `📊 <b>Thống kê</b>\n
🛍️ Sản phẩm: ${prods?.length || 0}
👀 Tổng lượt quan tâm: ${totalClicks}
📤 Bài đã đăng: ${postsTotal.count || 0} (hôm nay ${postsToday.count || 0})
⏰ Bài đang hẹn giờ: ${sched.count || 0}
${top ? `\n<b>Top quan tâm:</b>\n${top}` : ""}`,
  );
}

/** Thêm sản phẩm từ link Shopee dán vào chat. */
async function addProductFromUrl(chatId: number | string, url: string) {
  const ids = parseShopeeIds(url);
  const m = url.match(/shopee\.vn\/([^?]*?)-i\.\d+\.\d+/i);
  let name = "Sản phẩm Shopee";
  if (m && m[1]) {
    try {
      name = decodeURIComponent(m[1]).replace(/-/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    } catch {}
  }
  const slug = ids ? `sp-${ids.itemId}` : `sp-${Date.now()}`;

  let affiliate: string;
  try {
    affiliate = buildAffiliateLink(url, { subId: slug });
  } catch (e) {
    await sendMessage(chatId, `⚠️ ${e instanceof Error ? e.message : e}`);
    return;
  }

  const sb = createSupabaseAdminClient();
  const { data, error } = await sb
    .from("products")
    .upsert(
      {
        name,
        slug,
        price: 0,
        shopee_item_id: ids?.itemId ?? null,
        affiliate_url: affiliate,
        source: "manual",
        status: "draft",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error || !data) {
    // 23505 = trùng unique (item_id đã có trong kho với slug khác).
    if ((error as { code?: string } | null)?.code === "23505") {
      await sendMessage(chatId, "ℹ️ Sản phẩm này đã có trong kho rồi.");
    } else {
      await sendMessage(chatId, `❌ Lỗi thêm SP: ${error?.message || "?"}`);
    }
    return;
  }
  await sendMessage(
    chatId,
    `✅ Đã thêm: <b>${name}</b> (nháp)\n` +
      `⚠️ Chưa có ảnh/giá — bấm 🐱 (userscript) trong tab Shopee để lấy ảnh+video, hoặc vào admin điền tay.\n` +
      `Tạo bài luôn cũng được (sẽ đăng dạng chữ nếu chưa có ảnh):`,
    [[{ text: "✍️ Tạo bài ngay", callback_data: `taobai:${data.id}` }]],
  );
}

/** Tạo bản nháp bài đăng cho 1 sản phẩm: AI viết caption → gửi preview + nút. */
async function startPostDraft(chatId: number | string, productId: string) {
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
  const sb = createSupabaseAdminClient();
  const { data: post } = await sb
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

  if (error || !post) {
    await sendMessage(chatId, `❌ Lỗi viết caption: ${error || "không lưu được"}`);
    return;
  }
  const noImageWarn = product.image_url
    ? ""
    : "⚠️ <i>SP chưa có ảnh → đăng dạng chữ. Bấm 🐱 userscript trong tab Shopee để lấy ảnh+video trước.</i>\n\n";
  await sendMessage(
    chatId,
    `📝 <b>Bản nháp:</b>\n\n${noImageWarn}${caption}\n\n${product.price > 0 ? formatPriceVND(product.price) : ""}`,
    [
      [{ text: "✅ Đăng ngay", callback_data: `dang:${post.id}` }],
      [
        { text: "🌙 Hẹn 20h", callback_data: `lich:${post.id}:20` },
        { text: "🌅 Hẹn 8h sáng", callback_data: `lich:${post.id}:8` },
      ],
      [{ text: "❌ Hủy", callback_data: `huy:${post.id}` }],
    ],
  );
}

/** Tạo bài theo TÊN sản phẩm (cho lệnh bằng lời của trợ lý). */
async function startPostDraftByQuery(chatId: number | string, query: string) {
  const sb = createSupabaseAdminClient();
  const { data } = await sb
    .from("products")
    .select("id,name")
    .ilike("name", `%${query}%`)
    .limit(5);
  if (!data || data.length === 0) {
    await sendMessage(chatId, `Không tìm thấy sản phẩm khớp "<b>${query}</b>".`);
    return;
  }
  if (data.length === 1) {
    await startPostDraft(chatId, data[0].id);
    return;
  }
  // Nhiều kết quả → cho chọn.
  await sendMessage(
    chatId,
    `Tìm thấy ${data.length} sản phẩm khớp "<b>${query}</b>" — chọn cái cần tạo bài:`,
    data.map((p) => [
      { text: p.name.slice(0, 50), callback_data: `taobai:${p.id}` },
    ]),
  );
}

/** Liệt kê trí nhớ dài hạn + nút xóa từng dòng. */
async function showMemories(chatId: number | string) {
  const mems = await listMemories();
  if (mems.length === 0) {
    await sendMessage(
      chatId,
      "🧠 Trí nhớ trống. Cứ dặn em \"nhớ giùm anh ...\" là em ghi lại nha.",
    );
    return;
  }
  const list = mems.map((m, i) => `${i + 1}. ${m.content}`).join("\n");
  await sendMessage(
    chatId,
    `🧠 <b>Em đang nhớ ${mems.length} điều:</b>\n${list}\n\nBấm để xóa:`,
    mems.map((m) => [
      { text: `🗑️ ${m.content.slice(0, 40)}`, callback_data: `quenmem:${m.id}` },
    ]),
  );
}

/** Quản lý pool API key: /key [list] · /key add <KEY> [provider] [model] · /key del <id> */
async function handleKeyCommand(chatId: number | string, raw: string) {
  const parts = raw.trim().split(/\s+/);
  const sub = (parts[1] || "list").toLowerCase();
  const provNames = Object.keys(PROVIDER_PRESETS).join(" / ");

  if (sub === "add") {
    const k = parts[2];
    if (!k) {
      await sendMessage(
        chatId,
        `Cú pháp: <code>/key add &lt;KEY&gt; [provider] [model]</code>\n` +
          `provider: ${provNames} — hoặc dán full base_url. Bỏ trống = Gemini.\n` +
          `Vd: <code>/key add sk-xxx deepseek</code> · <code>/key add sk-xxx anthropic claude-sonnet-4-6</code>`,
      );
      return;
    }
    const prov = parts[3];
    let baseUrl: string | undefined;
    let model: string | undefined;
    let label: string | undefined;
    if (prov) {
      const preset = PROVIDER_PRESETS[prov.toLowerCase()];
      if (preset) {
        baseUrl = preset.base;
        model = parts[4] || preset.model;
        label = prov.toLowerCase();
      } else if (/^https?:\/\//.test(prov)) {
        baseUrl = prov;
        model = parts[4];
      }
    }
    const id = await addKey(k, { baseUrl, model, label });
    await sendMessage(
      chatId,
      `✅ Đã thêm key (…${k.slice(-4)})${label ? ` · ${label}` : ""}${model ? ` · ${model}` : ""}. Pool tự dùng ngay.`,
      id ? [[{ text: "🗑️ Hủy", callback_data: `delkey:${id}` }]] : undefined,
    );
    return;
  }
  if (sub === "del" || sub === "xoa") {
    const id = Number(parts[2]);
    if (Number.isNaN(id)) {
      await sendMessage(chatId, "Cú pháp: <code>/key del &lt;id&gt;</code> (xem id ở /key list)");
      return;
    }
    await deleteKey(id);
    await sendMessage(chatId, `🗑️ Đã xóa key #${id}.`);
    return;
  }
  // list
  const keys = await listKeys();
  if (!keys.length) {
    await sendMessage(chatId, "Chưa có API key nào. Thêm: <code>/key add &lt;KEY&gt;</code>");
    return;
  }
  const lines = keys
    .map(
      (k) =>
        `#${k.id} ${k.masked} · ${k.model}${k.label ? ` (${k.label})` : ""}${k.active ? "" : " ⛔"}`,
    )
    .join("\n");
  await sendMessage(
    chatId,
    `🔑 <b>${keys.length} API key</b> (pool xoay vòng, 429 → nhảy key kế):\n${lines}\n\n` +
      `Thêm: <code>/key add &lt;KEY&gt; [provider] [model]</code> · Xóa: <code>/key del &lt;id&gt;</code>`,
  );
}

/** Thực thi ACTION do trợ lý phát ra. */
async function executeAction(chatId: number | string, action: AgentAction) {
  if (!action) return;
  if (action.kind === "hot") await showHot(chatId);
  else if (action.kind === "timhang") await showFindGuide(chatId);
  else if (action.kind === "duyet") await showDrafts(chatId);
  else if (action.kind === "stats") await showStats(chatId);
  else if (action.kind === "taobai") await startPostDraftByQuery(chatId, action.query);
  else if (action.kind === "nho") {
    await saveMemory(action.content);
    await sendMessage(chatId, `🧠 <i>Đã ghi nhớ:</i> ${action.content}`);
  }
}

async function handleMessage(msg: any) {
  const chatId = msg.chat?.id;
  if (!chatId) return;
  if (!authorized(chatId)) {
    await sendMessage(chatId, `⛔ Không có quyền. Chat ID của bạn: ${chatId}`);
    return;
  }
  const raw: string = (msg.text || "").trim();
  const text = raw.toLowerCase();

  // Dán thẳng API key → tự thêm vào pool (Gemini AIza… / AQ.… / OpenAI sk-…)
  if (/^(AIza[\w-]{20,}|AQ\.[A-Za-z0-9._-]{20,}|sk-[\w-]{20,})$/.test(raw)) {
    const id = await addKey(raw);
    await sendMessage(
      chatId,
      `🔑 Đã thêm key (…${raw.slice(-4)}) vào pool. Tự xoay vòng, khỏi deploy.`,
      id ? [[{ text: "🗑️ Hủy (lỡ dán nhầm)", callback_data: `delkey:${id}` }]] : undefined,
    );
    return;
  }

  // Dán link Shopee → thêm sản phẩm
  const urlMatch = raw.match(/https?:\/\/[^\s]+/);
  if (urlMatch && /shopee\.vn/i.test(urlMatch[0])) {
    if (isShopeeProductUrl(urlMatch[0])) {
      await addProductFromUrl(chatId, urlMatch[0]);
    } else {
      await sendMessage(chatId, "Link Shopee không hợp lệ (cần dạng ...-i.shopId.itemId).");
    }
    return;
  }

  if (text.startsWith("/id")) {
    await sendMessage(chatId, `Chat ID của bạn: <code>${chatId}</code>`);
    return;
  }
  if (text.startsWith("/thongke") || text.includes("thống kê")) {
    await showStats(chatId);
    return;
  }
  if (text.startsWith("/timhang")) {
    await showFindGuide(chatId);
    return;
  }
  if (text.startsWith("/duyet")) {
    await showDrafts(chatId);
    return;
  }
  if (text.startsWith("/nho")) {
    await showMemories(chatId);
    return;
  }
  if (text.startsWith("/key")) {
    await handleKeyCommand(chatId, raw);
    return;
  }
  if (text.startsWith("/start") || text.startsWith("/help") || text === "/menu") {
    await sendMessage(chatId, WELCOME);
    return;
  }
  if (text.startsWith("/hot")) {
    await showHot(chatId);
    return;
  }

  // Mọi tin nhắn còn lại → trợ lý AI (nói chuyện tự nhiên + có thể tự phát lệnh).
  if (!raw) return;
  const { reply, action } = await chatAgent(String(chatId), raw);
  if (reply) await sendMessage(chatId, reply);
  await executeAction(chatId, action);
}

async function handleCallback(cq: any) {
  const chatId = cq.message?.chat?.id;
  const data: string = cq.data || "";
  await answerCallback(cq.id);
  if (!chatId || !authorized(chatId)) return;

  const sb = createSupabaseAdminClient();

  // Tạo bài: AI viết caption -> lưu nháp -> nút Đăng ngay / Hẹn giờ / Hủy
  if (data.startsWith("taobai:")) {
    const productId = data.slice("taobai:".length);
    await startPostDraft(chatId, productId);
    return;
  }

  // Hẹn giờ đăng
  if (data.startsWith("lich:")) {
    const parts = data.split(":"); // lich : postId : hour
    const postId = parts[1];
    const hour = Number(parts[2]);
    const iso = nextVnTime(hour);
    await sb
      .from("posts")
      .update({ status: "approved", scheduled_at: iso })
      .eq("id", postId);
    await sendMessage(chatId, `⏰ Đã hẹn đăng lúc <b>${fmtVn(iso)}</b>. Bot sẽ tự đăng.`);
    return;
  }

  // Đăng ngay
  if (data.startsWith("dang:")) {
    const postId = data.slice("dang:".length);
    const post = await adminGetPost(postId);
    if (!post) return;
    await sendMessage(chatId, "📤 Đang đăng lên fanpage...");
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
          published_at: new Date().toISOString(),
          error: null,
        })
        .eq("id", postId);
      await sendMessage(chatId, `✅ Đã đăng!\nhttps://facebook.com/${fbPostId}`);
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      await sb.from("posts").update({ status: "failed", error: m }).eq("id", postId);
      await sendMessage(chatId, `❌ Đăng lỗi: ${m}`);
    }
    return;
  }

  // Hủy nháp
  if (data.startsWith("huy:")) {
    const postId = data.slice("huy:".length);
    await sb.from("posts").delete().eq("id", postId);
    await sendMessage(chatId, "🗑️ Đã hủy bản nháp.");
    return;
  }

  // Hủy key vừa thêm (lỡ dán nhầm)
  if (data.startsWith("delkey:")) {
    const id = Number(data.slice("delkey:".length));
    if (!Number.isNaN(id)) {
      await deleteKey(id);
      await sendMessage(chatId, "🗑️ Đã xóa key.");
    }
    return;
  }

  // Xóa 1 điều trong trí nhớ dài hạn
  if (data.startsWith("quenmem:")) {
    const id = Number(data.slice("quenmem:".length));
    if (!Number.isNaN(id)) {
      await deleteMemory(id);
      await sendMessage(chatId, "🧠 Đã quên điều đó.");
    }
    return;
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const update = await req.json().catch(() => null);
  try {
    if (update?.message) await handleMessage(update.message);
    else if (update?.callback_query) await handleCallback(update.callback_query);
  } catch (e) {
    console.error("telegram error", e);
  }
  return NextResponse.json({ ok: true });
}
