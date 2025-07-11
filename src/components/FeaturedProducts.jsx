import { ProductCard } from "./ProductCard"; // Đảm bảo ProductCard được export đúng
import { Flame } from "lucide-react";

const featuredProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max 256GB - Chính hãng VN/A",
    price: 28990000,
    originalPrice: 34990000,
    discount: 17,
    rating: 4.9,
    reviews: 2340,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/iphone-15-pro-max",
    badge: "Best Seller",
    sold: 1200,
  },
  {
    id: 2,
    name: "Áo thun nam cotton 100% form rộng basic",
    price: 149000,
    originalPrice: 299000,
    discount: 50,
    rating: 4.7,
    reviews: 5670,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/ao-thun-nam",
    badge: "Hot Sale",
    sold: 3400,
  },
  {
    id: 3,
    name: "Túi xách nữ da PU cao cấp thời trang",
    price: 399000,
    originalPrice: 799000,
    discount: 50,
    rating: 4.8,
    reviews: 1890,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/tui-xach-nu",
    badge: "Trending",
    sold: 890,
  },
  {
    id: 4,
    name: "Giày sneaker nam thể thao chạy bộ",
    price: 599000,
    originalPrice: 1200000,
    discount: 50,
    rating: 4.6,
    reviews: 3210,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/giay-sneaker",
    badge: "Flash Sale",
    sold: 2100,
  },
  {
    id: 5,
    name: "Serum Vitamin C The Ordinary 30ml",
    price: 320000,
    originalPrice: 450000,
    discount: 29,
    rating: 4.9,
    reviews: 4560,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/serum-vitamin-c",
    badge: "Top Rated",
    sold: 5600,
  },
  {
    id: 6,
    name: "Tai nghe Bluetooth AirPods Pro Max",
    price: 2990000,
    originalPrice: 6990000,
    discount: 57,
    rating: 4.8,
    reviews: 1230,
    // image: "https://via.placeholder.com/300x300",
    shopeeUrl: "https://shopee.vn/product/airpods-pro",
    badge: "Limited",
    sold: 450,
  },
];

export function FeaturedProducts() {
  return (
    <section id="featured-products" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <h2 className="text-4xl font-bold text-gray-900">Đồ Xịn Hot Nhất</h2>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Những sản phẩm chất lượng cao được yêu thích nhất với giá cả hợp lý
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View More */}
        <div className="text-center">
          <button className="bg-orange-500 hover:bg-orange-600 px-8 py-3 text-white font-bold rounded-lg transition-colors">
            Xem Thêm Đồ Xịn 🏠
          </button>
        </div>
      </div>
    </section>
  );
}
