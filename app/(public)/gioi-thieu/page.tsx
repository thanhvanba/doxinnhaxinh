import type { Metadata } from "next";

import { BrandStory } from "@/components/brand-story";
import { TrustSection } from "@/components/trust-section";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description:
    "Câu chuyện và cam kết của Đồ Xịn Nhà Xinh — đồ xịn cho ngôi nhà xinh.",
};

export default function GioiThieuPage() {
  return (
    <main>
      <BrandStory />
      <TrustSection />
    </main>
  );
}
