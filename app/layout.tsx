import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Đồ Xịn Nhà Xinh — Đồ xịn giá tốt từ Shopee",
    template: "%s · Đồ Xịn Nhà Xinh",
  },
  description:
    "Tuyển chọn sản phẩm chất lượng cao, deal hot và voucher từ Shopee. Đồ xịn cho nhà xinh!",
  openGraph: {
    title: "Đồ Xịn Nhà Xinh",
    description:
      "Tuyển chọn sản phẩm chất lượng cao, deal hot và voucher từ Shopee. Đồ xịn cho nhà xinh!",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body>{children}</body>
    </html>
  );
}
