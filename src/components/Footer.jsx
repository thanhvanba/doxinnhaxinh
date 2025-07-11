import { ShoppingBag, Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold">Đồ Xịn Nhà Xinh</span>
            </div>
            <p className="text-gray-400 mb-4">
              Tìm kiếm và chia sẻ những sản phẩm chất lượng cao với giá tốt nhất từ Shopee. Đồ xịn cho nhà xinh!
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Điện thoại
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Thời trang
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Sắc đẹp
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Nhà cửa
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-white">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Hướng dẫn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  Chính sách
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Theo dõi chúng tôi</h3>
            <p className="text-gray-400 mb-4">Nhận thông báo về các deal hot mới nhất</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm"
              />
              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded text-sm">Đăng ký</button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Đồ Xịn Nhà Xinh. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
