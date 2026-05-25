// ─── Store ────────────────────────────────────────────────────────────────────
export interface StoreSettings {
  id: number;
  store_name: string;
  slogan: string | null;
  logo_url: string | null;
  whatsapp_number: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string;
  currency: string;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number;
  name_ar: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ─── Brand ────────────────────────────────────────────────────────────────────
export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface ProductImage {
  id: number;
  image_url: string;
  sort_order: number;
}

export interface ProductSpec {
  id: number;
  spec_name: string;
  spec_value: string;
}

export interface Product {
  id: number;
  name_ar: string;
  slug: string;
  description_ar: string | null;
  price: number;
  old_price: number | null;
  discount_percent: number | null;
  currency: string;
  main_image_url: string | null;
  condition: 'new' | 'used' | 'refurbished';
  storage: string | null;
  ram: string | null;
  color: string | null;
  warranty: string | null;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
  stock_status: 'in_stock' | 'out_of_stock';
  rating: number | null;
  review_count: number;
  bought_recently: number;
  brand: Brand | null;
  category: Category | null;
  images: ProductImage[];
  specs: ProductSpec[];
}

// ─── Filters ──────────────────────────────────────────────────────────────────
export type SortOption = 'newest' | 'price_low' | 'price_high' | 'popular';

export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  is_offer?: boolean;
  is_featured?: boolean;
  sort?: SortOption;
  page?: number;
  limit?: number;
}
