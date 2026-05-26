// ── DB queries — all Prisma calls are here.
// Pages import from this file. To revert to mock data,
// change these functions to return from mock-data.ts instead.

import { prisma } from './prisma';
import type { StoreSettings, Category, Brand, Product } from '@/types';

// ─── Helpers: convert Prisma types → our types ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProduct(p: any): Product {
  return {
    ...p,
    price:     Number(p.price),
    old_price: p.old_price != null ? Number(p.old_price) : null,
    rating:    p.rating    != null ? Number(p.rating)    : null,
  };
}

// ─── Store Settings ───────────────────────────────────────────────────────────

export async function getStoreSettings(): Promise<StoreSettings> {
  const settings = await prisma.storeSettings.findFirst({ orderBy: { id: 'asc' } });

  // Fallback if DB not yet seeded
  if (!settings) {
    return {
      id: 1, store_name: 'Yasser Phone', slogan: 'Premium Mobile Store',
      logo_url: null, whatsapp_number: '22232816779', phone: '+222 32 81 67 79',
      email: null, address: 'نواكشوط', city: 'نواكشوط', currency: 'MRU',
      facebook_url: null, instagram_url: null, tiktok_url: null,
    };
  }
  return settings;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getActiveCategories(): Promise<Category[]> {
  return prisma.category.findMany({
    where:   { is_active: true },
    orderBy: { sort_order: 'asc' },
  });
}

// ─── Brands ───────────────────────────────────────────────────────────────────

export async function getActiveBrands(): Promise<Brand[]> {
  return prisma.brand.findMany({
    where:   { is_active: true },
    orderBy: { name: 'asc' },
  });
}

// Arabic label map for well-known brand names (case-insensitive key)
const BRAND_AR_LABELS: Record<string, string> = {
  apple:   'آيفون',
  iphone:  'آيفون',
  samsung: 'سامسونج',
  xiaomi:  'شاومي',
  tecno:   'تكنو',
  infinix: 'إنفنكس',
  huawei:  'هواوي',
  oppo:    'أوبو',
  vivo:    'فيفو',
  nokia:   'نوكيا',
  realme:  'ريلمي',
  motorola:'موتورولا',
  oneplus: 'ون بلس',
};

export async function getNavBrands(): Promise<{ slug: string; name: string; labelAr: string }[]> {
  const brands = await prisma.brand.findMany({
    where:   { is_active: true },
    orderBy: { name: 'asc' },
    select:  { slug: true, name: true },
  });
  return brands.map((b) => ({
    slug:    b.slug,
    name:    b.name,
    // Use known Arabic label, fall back to brand name itself
    labelAr: BRAND_AR_LABELS[b.slug.toLowerCase()] ?? BRAND_AR_LABELS[b.name.toLowerCase()] ?? b.name,
  }));
}

// ─── Products: common include ─────────────────────────────────────────────────

const PRODUCT_INCLUDE = {
  brand:    true,
  category: true,
  images:   { orderBy: { sort_order: 'asc' as const } },
  specs:    true,
} as const;

// ─── Featured products ────────────────────────────────────────────────────────

export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where:   { is_featured: true, is_active: true },
    include: PRODUCT_INCLUDE,
    orderBy: { created_at: 'desc' },
    take:    limit,
  });
  return rows.map(toProduct);
}

// ─── Offer products ───────────────────────────────────────────────────────────

export async function getOfferProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where:   { is_offer: true, is_active: true },
    include: PRODUCT_INCLUDE,
    orderBy: { discount_percent: 'desc' },
    take:    limit,
  });
  return rows.map(toProduct);
}

// ─── Latest products ──────────────────────────────────────────────────────────

export async function getLatestProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where:   { is_active: true },
    include: PRODUCT_INCLUDE,
    orderBy: { created_at: 'desc' },
    take:    limit,
  });
  return rows.map(toProduct);
}

// ─── All products (with filters) ─────────────────────────────────────────────

interface GetProductsOptions {
  search?:      string;
  categorySlug?: string;
  brandSlug?:   string;
  isFeatured?:  boolean;
  isOffer?:     boolean;
  sort?:        'newest' | 'price_low' | 'price_high' | 'popular';
}

export async function getProducts(opts: GetProductsOptions = {}): Promise<Product[]> {
  const { search, categorySlug, brandSlug, isFeatured, isOffer, sort = 'newest' } = opts;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { is_active: true };

  if (search) {
    where.OR = [
      { name_ar:        { contains: search } },
      { description_ar: { contains: search } },
    ];
  }
  if (categorySlug) where.category = { slug: categorySlug };
  if (brandSlug)    where.brand    = { slug: brandSlug };
  if (isFeatured)   where.is_featured = true;
  if (isOffer)      where.is_offer    = true;

  const orderBy =
    sort === 'price_low'  ? { price: 'asc'  as const } :
    sort === 'price_high' ? { price: 'desc' as const } :
    sort === 'popular'    ? { bought_recently: 'desc' as const } :
    { created_at: 'desc' as const };

  const rows = await prisma.product.findMany({
    where,
    include: PRODUCT_INCLUDE,
    orderBy,
  });
  return rows.map(toProduct);
}

// ─── Single product by slug ───────────────────────────────────────────────────

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where:   { slug },
    include: PRODUCT_INCLUDE,
  });
  return row ? toProduct(row) : null;
}

// ─── Related products (same category, excluding current) ─────────────────────

export async function getRelatedProducts(productId: number, categoryId: number | null, limit = 5): Promise<Product[]> {
  if (!categoryId) return [];
  const rows = await prisma.product.findMany({
    where:   { category_id: categoryId, id: { not: productId }, is_active: true },
    include: PRODUCT_INCLUDE,
    orderBy: { bought_recently: 'desc' },
    take:    limit,
  });
  return rows.map(toProduct);
}
