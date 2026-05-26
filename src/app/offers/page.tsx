import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/products/ProductCard';
import { FloatingWhatsApp } from '@/components/ui/WhatsAppButton';
import { getStoreSettings, getOfferProducts, getNavBrands, getNavCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OffersPage() {
  const [settings, offers, navBrands, navCategories] = await Promise.all([
    getStoreSettings(),
    getOfferProducts(50),
    getNavBrands(),
    getNavCategories(),
  ]);

  return (
    <>
      <Header settings={settings} navBrands={navBrands} navCategories={navCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-[var(--c-border)]">
          <h1 className="font-display font-bold text-2xl text-[var(--c-text)]">عروض اليوم</h1>
          <p className="text-sm text-[var(--c-muted)] mt-1">
            <span className="num-latin font-semibold text-[var(--c-text)]">{offers.length}</span> عرض متاح الآن
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {offers.map((p) => (
              <ProductCard key={p.id} product={p} whatsappNumber={settings.whatsapp_number} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[var(--c-muted)]">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-lg font-semibold">لا توجد عروض متاحة حالياً</p>
            <a href="/products" className="mt-3 inline-block text-sm text-[var(--c-link)] hover:underline">
              تصفح جميع المنتجات
            </a>
          </div>
        )}
      </main>

      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsapp_number} />
    </>
  );
}
