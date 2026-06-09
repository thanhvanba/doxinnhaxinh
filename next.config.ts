import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép ảnh sản phẩm từ CDN ngoài (Shopee...) ở các GĐ sau.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // Đảm bảo BOT.md (não con bot — khác CLAUDE.md) được đóng gói vào function bot
  // trên Vercel để fs.readFileSync đọc được lúc chạy.
  outputFileTracingIncludes: {
    "/api/telegram": ["./BOT.md"],
  },
};

export default nextConfig;
