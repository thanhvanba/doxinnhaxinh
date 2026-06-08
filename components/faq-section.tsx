import { HelpCircle, Plus } from "lucide-react";

const faqs = [
  {
    q: "Mua hàng trên website này như thế nào?",
    a: "Bạn bấm nút “Mua trên Shopee” ở mỗi sản phẩm, hệ thống sẽ chuyển bạn sang trang Shopee chính hãng để đặt và thanh toán an toàn như bình thường.",
  },
  {
    q: "Giá ở đây có đắt hơn mua trực tiếp không?",
    a: "Hoàn toàn không. Bạn mua đúng giá niêm yết trên Shopee, không phát sinh thêm phí. Đây là website giới thiệu sản phẩm (affiliate), không tăng giá bán.",
  },
  {
    q: "Sản phẩm có được bảo hành không?",
    a: "Có. Bảo hành, đổi trả và vận chuyển đều do người bán trên Shopee thực hiện theo chính sách của Shopee.",
  },
  {
    q: "Website có thu thêm phí gì của tôi không?",
    a: "Không. Bạn không phải trả bất kỳ khoản phí nào cho website. Chúng tôi nhận hoa hồng tiếp thị từ Shopee khi bạn mua qua liên kết.",
  },
  {
    q: "Ship hàng mất bao lâu?",
    a: "Thời gian giao hàng phụ thuộc vào người bán và đơn vị vận chuyển trên Shopee, thường từ 2–5 ngày tuỳ khu vực.",
  },
];

export function FaqSection() {
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            <HelpCircle className="size-4" /> Hỗ trợ
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Những thắc mắc phổ biến về mua hàng, giá và bảo hành
          </p>
        </div>

        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-2xl border bg-card px-5 py-4 shadow-sm [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {faq.q}
                <Plus className="size-5 shrink-0 text-primary transition-transform duration-300 group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
