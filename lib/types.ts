import type { LucideIcon } from "lucide-react";

export type Product = {
  id: number | string;
  slug?: string;
  name: string;
  price: number; // VND
  originalPrice: number;
  discount: number; // %
  rating: number;
  reviews: number;
  image?: string;
  affiliateUrl: string;
  badge?: string;
  sold: number;
  clicks: number;
  categorySlug?: string;
  categoryName?: string;
};

export type Category = {
  id: number | string;
  name: string;
  icon: LucideIcon;
  productCount: string;
  discount: string;
  isHot: boolean;
};
