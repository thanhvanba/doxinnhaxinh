"use client"
import { Star, ExternalLink, Users } from "lucide-react"
import image_defaut from "../../public/placeholder.svg"

export function ProductCard({ product }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Hot Sale":
      case "Flash Sale":
        return "bg-red-500"
      case "Best Seller":
        return "bg-green-500"
      case "Trending":
        return "bg-purple-500"
      case "Limited":
        return "bg-blue-500"
      case "Top Rated":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 shadow-lg bg-white rounded-lg">
      <div className="relative">
        <img
          src={product.image || image_defaut}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div
          className={`absolute top-3 left-3 ${getBadgeColor(product.badge)} text-white font-bold px-2 py-1 rounded text-xs`}
        >
          {product.badge}
        </div>
        <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-lg text-sm font-bold shadow-lg">
          -{product.discount}%
        </div>
        {product.sold && (
          <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Users className="h-3 w-3" />
            Đã bán {product.sold}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm mb-3 line-clamp-2 h-10 text-gray-900">{product.name}</h3>

        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-bold text-gray-900">{product.rating}</span>
          <span className="text-sm text-gray-500">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-bold text-orange-500">{formatPrice(product.price)}</span>
          </div>
          <div className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
        </div>

        <button
          className="w-full bg-orange-500 hover:bg-orange-600 font-bold shadow-lg text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
          onClick={() => window.open(product.shopeeUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4" />
          Mua Ngay Trên Shopee
        </button>
      </div>
    </div>
  )
}
