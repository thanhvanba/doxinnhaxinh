import { Shield, Users, Award, Clock } from "lucide-react"

const trustFeatures = [
  {
    icon: Shield,
    title: "Đồ xịn chất lượng cao",
    description: "Chỉ giới thiệu sản phẩm chất lượng cao, được kiểm duyệt kỹ lưỡng",
    stat: "99% hài lòng",
  },
  {
    icon: Users,
    title: "Cộng đồng yêu nhà xinh",
    description: "Hơn 100,000 gia đình tin tưởng và lựa chọn đồ xịn từ chúng tôi",
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
    description: "Đồ xịn mới được cập nhật liên tục, luôn có gì đó mới cho nhà bạn",
    stat: "24/7 update",
  },
]

export function TrustSection() {
  return (
    <section className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Tại Sao Chọn Đồ Xịn Nhà Xinh?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Cam kết mang đến những sản phẩm chất lượng cao nhất cho ngôi nhà xinh xắn của bạn
          </p>
        </div>

        {/* Trust Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {trustFeatures.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="bg-gray-800 border border-gray-700 text-center rounded-lg p-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300 mb-3 text-sm">{feature.description}</p>
                <div className="text-orange-400 font-bold">{feature.stat}</div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "100K+", label: "Người dùng hài lòng" },
            { number: "50K+", label: "Sản phẩm chất lượng" },
            { number: "1K+", label: "Deal hot mỗi ngày" },
            { number: "99%", label: "Tỷ lệ hài lòng" },
          ].map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold text-orange-400 mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
