import { Heart, Home, Star, Gift } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Nhà Xinh",
    description:
      "Mỗi sản phẩm được chọn lọc đều hướng đến việc làm cho ngôi nhà của bạn trở nên xinh xắn và ấm cúng hơn.",
  },
  {
    icon: Star,
    title: "Đồ Xịn",
    description:
      "Chúng tôi chỉ giới thiệu những sản phẩm chất lượng cao, được đánh giá tốt và có độ bền lâu dài.",
  },
  {
    icon: Gift,
    title: "Giá Yêu",
    description:
      "Săn deal, tìm voucher để mang đến cho bạn những sản phẩm chất lượng với giá cả yêu thương nhất.",
  },
];

export function BrandStory() {
  return (
    <section
      id="about"
      className="bg-linear-to-br from-primary/5 to-navy/5 py-16 lg:py-20"
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Heart className="size-7" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Câu Chuyện Đồ Xịn Nhà Xinh
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Chúng tôi tin rằng mỗi ngôi nhà đều xứng đáng có những món đồ{" "}
            <span className="font-semibold text-primary">chất lượng cao</span>{" "}
            với <span className="font-semibold text-destructive">giá cả hợp lý</span>.
            Đó là lý do &quot;Đồ Xịn Nhà Xinh&quot; ra đời!
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border bg-card/80 p-6 text-center shadow-sm backdrop-blur-sm"
              >
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border bg-card/60 p-8 text-center shadow-sm backdrop-blur-sm">
          <h3 className="font-display text-2xl font-bold">Sứ Mệnh Của Chúng Tôi</h3>
          <p className="mx-auto mt-3 max-w-3xl text-lg leading-relaxed text-foreground/80">
            &quot;Giúp mọi gia đình Việt Nam có thể trang trí và trang bị cho
            ngôi nhà của mình những món đồ chất lượng cao mà không cần lo lắng về
            giá cả. Bởi vì chúng tôi tin rằng,{" "}
            <span className="font-semibold text-primary">
              mỗi ngôi nhà đều xứng đáng được xinh đẹp
            </span>
            !&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
