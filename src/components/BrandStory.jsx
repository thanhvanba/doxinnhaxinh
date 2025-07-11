import { Heart, Home, Star, Gift } from "lucide-react";

const features = [
  {
    icon: <Home className="h-8 w-8 text-pink-500" />,
    bg: "bg-pink-100",
    title: "Nhà Xinh",
    description: "Mỗi sản phẩm được chọn lọc đều hướng đến việc làm cho ngôi nhà của bạn trở nên xinh xắn và ấm cúng hơn.",
  },
  {
    icon: <Star className="h-8 w-8 text-orange-500" />,
    bg: "bg-orange-100",
    title: "Đồ Xịn",
    description: "Chúng tôi chỉ giới thiệu những sản phẩm chất lượng cao, được đánh giá tốt và có độ bền lâu dài.",
  },
  {
    icon: <Gift className="h-8 w-8 text-green-500" />,
    bg: "bg-green-100",
    title: "Giá Yêu",
    description: "Săn deal, tìm voucher để mang đến cho bạn những sản phẩm chất lượng với giá cả yêu thương nhất.",
  },
];

export default function BrandStory() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-pink-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <div className="mb-16">
            <Heart className="h-16 w-16 text-pink-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Câu Chuyện Đồ Xịn Nhà Xinh</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Chúng tôi tin rằng mỗi ngôi nhà đều xứng đáng có những món đồ{" "}
              <span className="font-bold text-orange-500">chất lượng cao</span> với{" "}
              <span className="font-bold text-pink-500">giá cả hợp lý</span>. Đó là lý do "Đồ Xịn Nhà Xinh" ra đời!
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((item, index) => (
              <div
                key={index}
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center"
              >
                <div className={`w-16 h-16 ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Sứ Mệnh Của Chúng Tôi</h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              "Giúp mọi gia đình Việt Nam có thể trang trí và trang bị cho ngôi nhà của mình những món đồ chất lượng cao
              mà không cần phải lo lắng về giá cả. Bởi vì chúng tôi tin rằng,
              <span className="font-bold text-orange-500"> mỗi ngôi nhà đều xứng đáng được xinh đẹp</span>!"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
