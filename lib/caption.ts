import type { AdminProduct } from "./admin-products";
import { formatPriceVND } from "./format";

/**
 * Viết caption fanpage cho 1 sản phẩm bằng AI (endpoint chuẩn OpenAI).
 * Mặc định dùng OpenCode Zen + model free `minimax-m3-free`.
 * Đổi qua env: AI_API_KEY, AI_BASE_URL, AI_MODEL.
 */

/** Bỏ phần "suy nghĩ" của model reasoning (<think>...</think>). */
function stripThinking(s: string): string {
  return s
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .trim();
}

export async function generateCaption(product: AdminProduct): Promise<string> {
  const key = process.env.AI_API_KEY;
  if (!key) {
    throw new Error(
      "Thiếu AI_API_KEY trong .env.local (key OpenCode Zen / OpenAI).",
    );
  }
  const baseUrl = process.env.AI_BASE_URL || "https://opencode.ai/zen/v1";
  const model = process.env.AI_MODEL || "minimax-m3-free";

  const giaText =
    product.price > 0 ? `Giá: ${formatPriceVND(product.price)}` : "";
  const giamText =
    product.discount && product.discount > 0
      ? `Đang giảm ${product.discount}%`
      : "";

  const system = `Bạn viết content fanpage Facebook cho shop "Đồ Xịn Nhà Xinh" — đồ gia dụng, nội thất, trang trí nhà giá tốt.
Văn phong: thân thiện, vui vẻ, giọng bán hàng Việt Nam, dùng 2-5 emoji, có hook mở đầu, nêu lợi ích, có call-to-action.
TUYỆT ĐỐI không bịa giá/khuyến mãi ngoài dữ liệu. KHÔNG chèn link (link để ở comment). Dài 3-6 dòng, kết bằng 3-5 hashtag tiếng Việt.
Chỉ trả về NỘI DUNG CAPTION, không giải thích, không markdown.`;

  const userMsg = `Viết caption đăng fanpage cho sản phẩm:
- Tên: ${product.name}
${giaText ? `- ${giaText}\n` : ""}${giamText ? `- ${giamText}\n` : ""}Chỉ trả về caption.`;

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    }),
  });

  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(`AI lỗi: ${json.error?.message || res.statusText}`);
  }

  const raw: string = json.choices?.[0]?.message?.content || "";
  const text = stripThinking(raw);
  if (!text) {
    throw new Error(
      "Model trả về rỗng — thử đổi AI_MODEL (vd mimo-v2.5-free / claude-haiku-4-5).",
    );
  }
  return text;
}
