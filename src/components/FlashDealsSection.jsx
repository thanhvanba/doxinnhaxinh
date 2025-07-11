"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./ProductCard"
import { Clock, Zap } from "lucide-react"

const flashDeals = [
  {
    id: 101,
    name: "Laptop Gaming MSI GF63 Thin",
    price: 15990000,
    originalPrice: 25990000,
    discount: 38,
    rating: 4.7,
    reviews: 567,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/laptop-gaming",
    badge: "Flash Sale",
    sold: 89,
  },
  {
    id: 102,
    name: "Đồng hồ thông minh Apple Watch SE",
    price: 4990000,
    originalPrice: 7990000,
    discount: 38,
    rating: 4.8,
    reviews: 1890,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/apple-watch",
    badge: "Flash Sale",
    sold: 156,
  },
  {
    id: 103,
    name: "Máy ảnh Canon EOS M50 Mark II",
    price: 12990000,
    originalPrice: 18990000,
    discount: 32,
    rating: 4.9,
    reviews: 432,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/canon-eos",
    badge: "Flash Sale",
    sold: 67,
  },
]

export function FlashDealsSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 45,
    seconds: 30,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="deals" className="py-20 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Zap className="h-10 w-10 text-yellow-500" />
            <h2 className="text-4xl font-bold text-gray-900">Flash Sale</h2>
            <Zap className="h-10 w-10 text-yellow-500" />
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Clock className="h-6 w-6 text-red-600" />
            <span className="text-lg font-medium text-gray-700">Kết thúc trong:</span>
            <div className="flex gap-2">
              {[
                { value: timeLeft.hours, label: "Giờ" },
                { value: timeLeft.minutes, label: "Phút" },
                { value: timeLeft.seconds, label: "Giây" },
              ].map((time, index) => (
                <div key={index} className="text-center">
                  <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-bold text-lg min-w-[50px]">
                    {time.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{time.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xl text-gray-600">⚡ Giá sốc chỉ có trong thời gian có hạn - Nhanh tay kẻo lỡ!</p>
        </div>

        {/* Flash Deals Products */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {flashDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="bg-red-600 hover:bg-red-700 px-8 py-3 text-lg text-white font-bold rounded-lg transition-colors">
            ⚡ Xem Tất Cả Flash Sale
          </button>
        </div>
      </div>
    </section>
  )
}
