import { Shield, Users, Award, Clock } from "lucide-react";

import { stats } from "@/lib/data";

const trustFeatures = [
  {
    icon: Shield,
    title: "Đồ xịn chất lượng cao",
    description:
      "Chỉ giới thiệu sản phẩm chất lượng cao, được kiểm duyệt kỹ lưỡng",
    stat: "99% hài lòng",
  },
  {
    icon: Users,
    title: "Cộng đồng yêu nhà xinh",
    description:
      "Hơn 100,000 gia đình tin tưởng và lựa chọn đồ xịn từ chúng tôi",
    stat: "100K+ gia đình",
  },
  {
    icon: Award,
    title: "Deal được tuyển chọn",
    description: "Mọi sản phẩm đều được team chuyên gia tuyển chọn kỹ lưỡng",
    stat: "1000+ sản phẩm/ngày",
  },
  {
    icon: Clock,
    title: "Cập nhật liên tục",
    description:
      "Đồ xịn mới được cập nhật liên tục, luôn có gì đó mới cho nhà bạn",
    stat: "24/7 update",
  },
];

export function TrustSection() {
  return (
    <section className="bg-secondary/40 py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Tại Sao Chọn Đồ Xịn Nhà Xinh?
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Cam kết mang đến những sản phẩm chất lượng cao nhất cho ngôi nhà
            xinh xắn của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 text-center shadow-sm"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
                <div className="mt-3 font-semibold text-primary">
                  {feature.stat}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-4xl font-extrabold text-primary">
                {s.number}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
