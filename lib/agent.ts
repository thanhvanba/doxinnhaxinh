import fs from "fs";
import path from "path";

import { createSupabaseAdminClient } from "./supabase/admin";
import { formatPriceVND } from "./format";

/**
 * Trợ lý AI Telegram: nạp BOT.md (kiến thức bot — KHÁC CLAUDE.md vốn dành cho
 * Claude Code) + snapshot dữ liệu thật + lịch sử hội thoại → gọi model
 * (OpenCode Zen, chuẩn OpenAI) → trả lời + (tùy chọn) phát 1 ACTION để bot thực thi.
 */

export type AgentAction =
  | { kind: "hot" }
  | { kind: "timhang" }
  | { kind: "duyet" }
  | { kind: "stats" }
  | { kind: "taobai"; query: string }
  | { kind: "nho"; content: string }
  | null;

// ---------------------------------------------------------------------------
//  TRÍ NHỚ DÀI HẠN (bảng agent_memory) — fact sống xuyên cuộc trò chuyện.
// ---------------------------------------------------------------------------

export type MemoryRow = { id: number; content: string };

/** Lấy toàn bộ memory (mới nhất trước). Chịu lỗi mềm nếu bảng chưa có. */
export async function listMemories(): Promise<MemoryRow[]> {
  try {
    const sb = createSupabaseAdminClient();
    const { data, error } = await sb
      .from("agent_memory")
      .select("id,content")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error || !data) return [];
    return data as MemoryRow[];
  } catch {
    return [];
  }
}

/** Lưu 1 điều cần nhớ (bỏ qua nếu trùng nội dung gần đây). */
export async function saveMemory(content: string): Promise<void> {
  const c = content.trim();
  if (!c) return;
  try {
    const sb = createSupabaseAdminClient();
    const existing = await listMemories();
    if (existing.some((m) => m.content.trim().toLowerCase() === c.toLowerCase())) return;
    await sb.from("agent_memory").insert({ content: c });
  } catch {
    // chịu lỗi mềm
  }
}

/** Xóa 1 memory theo id. */
export async function deleteMemory(id: number): Promise<void> {
  try {
    const sb = createSupabaseAdminClient();
    await sb.from("agent_memory").delete().eq("id", id);
  } catch {
    // chịu lỗi mềm
  }
}

/** Bỏ phần suy nghĩ của model reasoning. */
function stripThinking(s: string): string {
  return s
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();
}

/** Đọc BOT.md — não con bot (cache theo cold-start). */
let _agentMd: string | null = null;
function loadAgentMd(): string {
  if (_agentMd != null) return _agentMd;
  try {
    _agentMd = fs.readFileSync(path.join(process.cwd(), "BOT.md"), "utf8");
  } catch {
    _agentMd =
      'Bạn là "Mèo Mập" — trợ lý của shop affiliate "Đồ Xịn Nhà Xinh". ' +
      "Trả lời tiếng Việt, ngắn gọn, thân thiện, chỉ dựa trên dữ liệu được cấp.";
  }
  return _agentMd;
}

/** Snapshot dữ liệu thật để model bám vào (sản phẩm + thống kê). */
async function buildSnapshot(): Promise<string> {
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
      .select("name,price,discount,sold,clicks,image_url,status")
      .order("clicks", { ascending: false })
      .limit(60),
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

  const list = prods || [];
  const totalClicks = list.reduce((s, p) => s + (p.clicks || 0), 0);
  const noImg = list.filter((p) => !p.image_url).length;

  const lines = list
    .slice(0, 40)
    .map((p) => {
      const gia = p.price > 0 ? formatPriceVND(p.price) : "chưa có giá";
      const sale = p.discount ? ` -${p.discount}%` : "";
      const ban = p.sold ? ` · đã bán ${p.sold}` : "";
      const qt = p.clicks ? ` · ${p.clicks} quan tâm` : "";
      const img = p.image_url ? "" : " · [CHƯA CÓ ẢNH]";
      return `- ${p.name} | ${gia}${sale}${ban}${qt}${img}`;
    })
    .join("\n");

  return [
    `## DỮ LIỆU THẬT (lúc này)`,
    `Tổng sản phẩm: ${list.length} · Tổng lượt quan tâm: ${totalClicks} · Chưa có ảnh: ${noImg}`,
    `Bài đã đăng: ${postsTotal.count || 0} (hôm nay ${postsToday.count || 0}) · Đang hẹn giờ: ${sched.count || 0}`,
    ``,
    `Danh sách sản phẩm (xếp theo lượt quan tâm giảm dần):`,
    lines || "(kho trống)",
  ].join("\n");
}

const PROTOCOL = `## CÁCH PHÁT LỆNH (quan trọng)
Khi anh Thành MUỐN THỰC HIỆN một việc, hãy trả lời ngắn gọn rồi xuống dòng CUỐI CÙNG ghi đúng 1 lệnh theo mẫu (không thêm chữ nào khác trên dòng đó):
- ACTION: HOT        → khi muốn xem/đăng sản phẩm hot, "đăng gì hôm nay"
- ACTION: TIMHANG    → khi muốn "tìm hàng mới", "kiếm hàng hot", "lấy hàng về" (bot điều hướng tới Shopee)
- ACTION: DUYET      → khi hỏi "hàng mới", "ứng viên", "hàng nháp chờ duyệt", "có hàng gì mới"
- ACTION: STATS      → khi hỏi số liệu/thống kê/hiệu quả
- ACTION: TAOBAI <từ khóa tên sản phẩm>  → khi muốn tạo bài đăng cho 1 sản phẩm cụ thể
- ACTION: NHO <điều cần nhớ>  → khi anh Thành dặn "nhớ giùm...", hoặc khi học được một SỞ THÍCH / QUYẾT ĐỊNH / NỘI QUY lâu dài đáng nhớ. Viết ngắn gọn 1 câu. KHÔNG ghi nhớ chuyện vặt/nhất thời/đã có trong trí nhớ.
Nếu chỉ hỏi đáp/tư vấn thông thường thì KHÔNG ghi dòng ACTION.
Mỗi lượt chỉ tối đa 1 dòng ACTION.`;

type ChatMsg = { role: "user" | "assistant"; content: string };

/** Lấy ~10 lượt gần nhất (chịu lỗi mềm nếu bảng chưa có). */
async function loadHistory(chatId: string): Promise<ChatMsg[]> {
  try {
    const sb = createSupabaseAdminClient();
    const { data, error } = await sb
      .from("agent_messages")
      .select("role,content")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error || !data) return [];
    return data.reverse() as ChatMsg[];
  } catch {
    return [];
  }
}

async function saveMessages(chatId: string, msgs: ChatMsg[]): Promise<void> {
  try {
    const sb = createSupabaseAdminClient();
    await sb
      .from("agent_messages")
      .insert(msgs.map((m) => ({ chat_id: chatId, role: m.role, content: m.content })));
  } catch {
    // chịu lỗi mềm — không có lịch sử vẫn chat được
  }
}

/** Tách dòng ACTION cuối (nếu có) khỏi nội dung hiển thị. */
function parseAction(text: string): { reply: string; action: AgentAction } {
  const lines = text.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i]
      .trim()
      .match(/^ACTION:\s*(HOT|TIMHANG|DUYET|STATS|TAOBAI|NHO)(?:\s+([\s\S]*))?$/i);
    if (m) {
      const kind = m[1].toUpperCase();
      const arg = (m[2] || "").trim();
      lines.splice(i, 1);
      const reply = lines.join("\n").trim();
      let action: AgentAction = null;
      if (kind === "HOT") action = { kind: "hot" };
      else if (kind === "TIMHANG") action = { kind: "timhang" };
      else if (kind === "DUYET") action = { kind: "duyet" };
      else if (kind === "STATS") action = { kind: "stats" };
      else if (kind === "TAOBAI" && arg) action = { kind: "taobai", query: arg };
      else if (kind === "NHO" && arg) action = { kind: "nho", content: arg };
      return { reply, action };
    }
  }
  return { reply: text.trim(), action: null };
}

/** Trò chuyện với trợ lý. Trả về lời đáp + action (nếu model muốn làm gì). */
export async function chatAgent(
  chatId: string,
  userText: string,
): Promise<{ reply: string; action: AgentAction }> {
  const key = process.env.AI_API_KEY;
  if (!key) {
    return {
      reply:
        "Trợ lý chưa cấu hình AI_API_KEY. Tạm thời dùng lệnh: /hot · /thongke · /nho.",
      action: null,
    };
  }
  const baseUrl = process.env.AI_BASE_URL || "https://opencode.ai/zen/v1";
  const model = process.env.AI_MODEL || "mimo-v2.5-free";

  const [snapshot, history, memories] = await Promise.all([
    buildSnapshot(),
    loadHistory(chatId),
    listMemories(),
  ]);

  const memoryBlock = memories.length
    ? `## ĐIỀU CẦN NHỚ VỀ ANH THÀNH (trí nhớ dài hạn)\n${memories
        .map((m) => `- ${m.content}`)
        .join("\n")}`
    : "## ĐIỀU CẦN NHỚ VỀ ANH THÀNH\n(chưa có gì — khi học được sở thích/quyết định lâu dài thì dùng ACTION: NHO để ghi lại)";

  const system = `${loadAgentMd()}\n\n${memoryBlock}\n\n${snapshot}\n\n${PROTOCOL}`;

  const messages = [
    { role: "system", content: system },
    ...history,
    { role: "user", content: userText },
  ];

  let raw = "";
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, max_tokens: 1000, messages }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error?.message || res.statusText);
    }
    raw = json.choices?.[0]?.message?.content || "";
  } catch (e) {
    return {
      reply: `Trợ lý lỗi khi gọi AI: ${e instanceof Error ? e.message : e}. Thử lại hoặc dùng lệnh /hot.`,
      action: null,
    };
  }

  const text = stripThinking(raw) || "Em chưa rõ ý anh, anh nói lại giúp em nha.";
  const { reply, action } = parseAction(text);

  // Lưu lượt (lưu reply ĐÃ tách action cho gọn lịch sử).
  await saveMessages(chatId, [
    { role: "user", content: userText },
    { role: "assistant", content: reply || text },
  ]);

  return { reply: reply || "Ok anh 👍", action };
}
