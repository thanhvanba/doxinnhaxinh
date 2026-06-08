import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho phép ảnh sản phẩm từ CDN ngoài (Shopee...) ở các GĐ sau.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
