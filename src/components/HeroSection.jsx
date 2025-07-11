"use client"
import { Star, TrendingUp, Zap, ArrowDown } from "lucide-react"

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("featured-products")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block bg-white/20 text-white border border-white/30 mb-6 px-4 py-2 text-sm rounded-full">
            🏆 #1 Website Đồ Xịn Giá Tốt Việt Nam
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Đồ Xịn{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Nhà Xinh
            </span>{" "}
            Giá Yêu
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Khám phá hàng ngàn sản phẩm chất lượng cao cho{" "}
            <span className="font-bold text-yellow-300">ngôi nhà xinh xắn</span> của bạn. Đồ xịn - giá yêu - ship nhanh
            từ Shopee!
          </p>

          {/* Features */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full">
              <Star className="h-5 w-5 fill-current text-yellow-300" />
              <span className="font-medium">Sản phẩm 5⭐</span>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-300" />
              <span className="font-medium">Deal trending</span>
            </div>
            <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full">
              <Zap className="h-5 w-5 text-yellow-300" />
              <span className="font-medium">Flash sale</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-8 py-4 text-lg shadow-xl rounded-lg transition-colors"
              onClick={scrollToProducts}
            >
              🏠 Khám Phá Đồ Xịn Ngay
            </button>
            <a
              href="https://www.facebook.com/doxinnhaxinh" // 🔁 Đổi link này thành link thật của bạn
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold px-8 py-4 text-lg bg-transparent rounded-lg transition-colors">
                🔔 Theo dõi Fanpage
              </button>
            </a>

          </div>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ArrowDown className="h-6 w-6 mx-auto opacity-70" />
          </div>
        </div>
      </div>
    </div>
  )
}
