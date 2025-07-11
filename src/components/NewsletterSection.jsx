"use client"

import { useState } from "react"
import { Mail, Gift } from "lucide-react"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle newsletter subscription
    setIsSubscribed(true)
    setEmail("")
  }

  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <Gift className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Nhận Đồ Xịn Mỗi Ngày!</h2>
          <p className="text-xl mb-8 opacity-90">
            Đăng ký nhận thông báo về những sản phẩm chất lượng cao, deal hot và voucher miễn phí
          </p>

          {!isSubscribed ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  placeholder="Nhập email của bạn..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`pl-10 h-12 w-full rounded-lg px-4 py-2 text-gray-900 transition-all duration-300 
    ${email ? 'bg-white border border-blue-500 shadow-sm' : 'bg-gray-100 border border-gray-300'}`}
                />

              </div>
              <button
                type="submit"
                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Đăng Ký Ngay
              </button>
            </form>
          ) : (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <div className="text-2xl mb-2">🎉</div>
              <h3 className="text-xl font-bold mb-2">Chào mừng đến gia đình Đồ Xịn Nhà Xinh!</h3>
              <p className="opacity-90">Bạn sẽ nhận được những deal đồ xịn đầu tiên trong vòng 24h tới.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 text-sm opacity-80">
            <span>✅ Miễn phí 100%</span>
            <span>✅ Không spam</span>
            <span>✅ Hủy đăng ký bất cứ lúc nào</span>
          </div>
        </div>
      </div>
    </section>
  )
}
