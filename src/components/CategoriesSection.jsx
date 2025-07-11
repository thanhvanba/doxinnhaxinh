import { Smartphone, Shirt, Heart, Home, Baby, Car, Gamepad2, Book } from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Điện thoại & Phụ kiện",
    icon: Smartphone,
    productCount: "15K+",
    discount: "Giảm đến 60%",
    color: "bg-blue-500",
    isHot: true,
  },
  {
    id: 2,
    name: "Thời trang",
    icon: Shirt,
    productCount: "25K+",
    discount: "Giảm đến 70%",
    color: "bg-pink-500",
    isHot: true,
  },
  {
    id: 3,
    name: "Sắc đẹp",
    icon: Heart,
    productCount: "12K+",
    discount: "Giảm đến 50%",
    color: "bg-red-500",
    isHot: false,
  },
  {
    id: 4,
    name: "Nhà cửa & Đời sống",
    icon: Home,
    productCount: "18K+",
    discount: "Giảm đến 45%",
    color: "bg-green-500",
    isHot: false,
  },
  {
    id: 5,
    name: "Mẹ & Bé",
    icon: Baby,
    productCount: "8K+",
    discount: "Giảm đến 55%",
    color: "bg-yellow-500",
    isHot: true,
  },
  {
    id: 6,
    name: "Ô tô & Xe máy",
    icon: Car,
    productCount: "5K+",
    discount: "Giảm đến 40%",
    color: "bg-gray-500",
    isHot: false,
  },
  {
    id: 7,
    name: "Thể thao & Du lịch",
    icon: Gamepad2,
    productCount: "7K+",
    discount: "Giảm đến 65%",
    color: "bg-purple-500",
    isHot: false,
  },
  {
    id: 8,
    name: "Sách & Văn phòng phẩm",
    icon: Book,
    productCount: "4K+",
    discount: "Giảm đến 35%",
    color: "bg-indigo-500",
    isHot: false,
  },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Danh Mục Nổi Bật</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Khám phá hàng ngàn sản phẩm chất lượng theo từng danh mục
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg overflow-hidden bg-white rounded-lg"
              >
                <div className="p-6 text-center relative">
                  {category.isHot && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">HOT</div>
                  )}

                  <div
                    className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{category.name}</h3>
                  <p className="text-xs text-gray-500 mb-1">{category.productCount} sản phẩm</p>
                  <p className="text-xs font-semibold text-orange-500">{category.discount}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
