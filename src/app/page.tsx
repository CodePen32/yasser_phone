import { Header }         from '@/components/layout/Header';
import { Footer }         from '@/components/layout/Footer';
import { HeroSection }    from '@/components/home/HeroSection';
import { FeaturesBar }    from '@/components/home/FeaturesBar';
import { CategoryStrip }  from '@/components/home/CategoryStrip';
import { ProductSection } from '@/components/home/ProductSection';
import { ShopByPrice }    from '@/components/home/ShopByPrice';
import { FloatingWhatsApp } from '@/components/ui/WhatsAppButton';
import {
  getStoreSettings,
  getActiveCategories,
  getNavBrands,
  getNavCategories,
  getFeaturedProducts,
  getOfferProducts,
  getLatestProducts,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [settings, categories, navBrands, navCategories, featured, offers, latest] = await Promise.all([
    getStoreSettings(),
    getActiveCategories(),
    getNavBrands(),
    getNavCategories(),
    getFeaturedProducts(10),
    getOfferProducts(10),
    getLatestProducts(10),
  ]);

  return (
    <>
      <Header settings={settings} navBrands={navBrands} navCategories={navCategories} />

      <main>
        <HeroSection settings={settings} />

        {/* Amazon-like quad cards row */}
        <ShopByPrice />

        <FeaturesBar />

        <CategoryStrip categories={categories} />

        {featured.length > 0 && (
          <ProductSection
            title="منتجات مميزة"
            subtitle="الأكثر طلباً وتقييماً من عملائنا"
            products={featured}
            viewAllHref="/products?featured=true"
            whatsappNumber={settings.whatsapp_number}
          />
        )}

        {offers.length > 0 && (
          <ProductSection
            title="عروض خاصة"
            subtitle="خصومات لا تفوت — لفترة محدودة"
            products={offers}
            viewAllHref="/offers"
            viewAllLabel="كل العروض ←"
            whatsappNumber={settings.whatsapp_number}
          />
        )}

        {latest.length > 0 && (
          <ProductSection
            title="أحدث المنتجات"
            subtitle="وصل حديثاً إلى متجرنا"
            products={latest}
            viewAllHref="/products"
            whatsappNumber={settings.whatsapp_number}
          />
        )}
      </main>

      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsapp_number} />
    </>
  );
}
