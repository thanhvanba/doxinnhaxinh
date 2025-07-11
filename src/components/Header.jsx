import { ShoppingBag, Menu } from "lucide-react"

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-orange-500" />
            <span className="text-xl font-bold text-gray-900">Đồ Xịn Nhà Xinh</span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-700 hover:text-orange-500 transition-colors">
              Trang chủ
            </a>
            <a href="#categories" className="text-gray-700 hover:text-orange-500 transition-colors">
              Danh mục
            </a>
            <a href="#deals" className="text-gray-700 hover:text-orange-500 transition-colors">
              Khuyến mãi
            </a>
            <a href="#about" className="text-gray-700 hover:text-orange-500 transition-colors">
              Giới thiệu
            </a>
          </nav>

          <button className="md:hidden bg-transparent border border-gray-300 rounded px-3 py-2">
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
