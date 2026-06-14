import type { AdminProduct } from "./admin-products";
import { formatPriceVND } from "./format";
import { chatCompletion } from "./ai";

/**
 * Viết caption fanpage cho 1 sản phẩm bằng AI (endpoint chuẩn OpenAI).
 * Dùng pool key trong lib/ai.ts (tự nhảy key khi hết quota). Cấu hình qua env:
 * AI_API_KEYS / AI_API_KEY, AI_BASE_URL, AI_MODEL.
 */

export async function generateCaption(product: AdminProduct): Promise<string> {
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

  return chatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: userMsg },
    ],
    { maxTokens: 1200 },
  );
}
