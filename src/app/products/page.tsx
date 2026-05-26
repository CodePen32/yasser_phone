import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { FloatingWhatsApp } from '@/components/ui/WhatsAppButton';
import { SortSelect } from '@/components/products/SortSelect';
import {
  getStoreSettings,
  getActiveCategories,
  getActiveBrands,
  getNavBrands,
  getProducts,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{
    q?:        string;
    category?: string;
    brand?:    string;
    featured?: string;
    offer?:    string;
    sort?:     'newest' | 'price_low' | 'price_high' | 'popular';
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, category, brand, featured, offer, sort } = await searchParams;

  const isOffer = offer === 'true';

  const [settings, categories, brands, navBrands, products] = await Promise.all([
    getStoreSettings(),
    getActiveCategories(),
    getActiveBrands(),
    getNavBrands(),
    getProducts({
      search:       q,
      categorySlug: category,
      brandSlug:    brand,
      isFeatured:   featured === 'true',
      isOffer:      isOffer,
      sort:         sort ?? 'newest',
    }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const activeBrand    = brands.find((b) => b.slug === brand);

  const title =
    q               ? `نتائج البحث: "${q}"` :
    isOffer         ? 'عروض اليوم' :
    activeCategory  ? activeCategory.name_ar :
    activeBrand     ? activeBrand.name :
    featured        ? 'المنتجات المميزة' :
                      'جميع المنتجات';

  return (
    <>
      <Header settings={settings} navBrands={navBrands} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display font-bold text-xl text-[var(--c-text)]">{title}</h1>
            <p className="text-sm text-[var(--c-muted)] mt-0.5">
              <span className="num-latin font-semibold text-[var(--c-text)]">{products.length}</span> منتج
            </p>
          </div>

          {/* Sort */}
          <SortSelect current={sort} q={q} category={category} brand={brand} featured={featured} offer={offer} />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 flex-wrap mb-6">
          <a
            href="/products"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              !category && !brand
                ? 'bg-[var(--c-accent)] text-slate-900 border-[var(--c-accent)]'
                : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-accent)]'
            }`}
          >
            الكل
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                cat.slug === category
                  ? 'bg-[var(--c-accent)] text-slate-900 border-[var(--c-accent)]'
                  : 'bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-border)] hover:border-[var(--c-accent)]'
              }`}
            >
              {cat.name_ar}
            </a>
          ))}
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsappNumber={settings.whatsapp_number} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[var(--c-muted)]">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-semibold">لا توجد منتجات مطابقة</p>
            <a href="/products" className="mt-3 inline-block text-sm text-[var(--c-link)] hover:underline">
              عرض جميع المنتجات
            </a>
          </div>
        )}
      </main>

      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsapp_number} />
    </>
  );
}
