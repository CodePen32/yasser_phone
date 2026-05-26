import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StarRating } from '@/components/ui/StarRating';
import { ProductCard } from '@/components/products/ProductCard';
import { FloatingWhatsApp } from '@/components/ui/WhatsAppButton';
import { getStoreSettings, getProductBySlug, getRelatedProducts, getNavBrands, getNavCategories } from '@/lib/db';
import { WhatsAppOrderButton } from '@/components/products/WhatsAppOrderButton';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

function toAbsoluteUrl(url: string | null | undefined, base: string): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${base}${url}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [settings, product] = await Promise.all([getStoreSettings(), getProductBySlug(slug)]);
  if (!product) return {};
  const appUrl  = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const pageUrl = `${appUrl}/products/${slug}`;
  const imgUrl  = toAbsoluteUrl(product.main_image_url, appUrl);
  return {
    title: `${product.name_ar} — ${settings.store_name}`,
    description: product.description_ar ?? `${product.name_ar} بسعر ${product.price.toLocaleString()} ${product.currency}`,
    openGraph: {
      title:       `${product.name_ar} — ${settings.store_name}`,
      description: product.description_ar ?? `السعر: ${product.price.toLocaleString()} ${product.currency}`,
      url:         pageUrl,
      images:      imgUrl ? [{ url: imgUrl, width: 800, height: 800, alt: product.name_ar }] : [],
      siteName:    settings.store_name,
      locale:      'ar_MR',
      type:        'website',
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const [settings, product, navBrands, navCategories] = await Promise.all([
    getStoreSettings(),
    getProductBySlug(slug),
    getNavBrands(),
    getNavCategories(),
  ]);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.category?.id ?? null);

  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const productUrl = `${appUrl}/products/${product.slug}`;
  const imageUrl   = toAbsoluteUrl(product.main_image_url, appUrl);
  const waMessage  = [
    `السلام عليكم، أنا مهتم بهذا المنتج:`,
    ``,
    `المنتج: ${product.name_ar}`,
    `السعر: ${product.price.toLocaleString()} ${product.currency}`,
    imageUrl ? `الصورة: ${imageUrl}` : '',
    `رابط المنتج: ${productUrl}`,
    ``,
    `هل ما زال متوفراً؟`,
  ].filter((l) => l !== null).join('\n');
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(waMessage)}`;

  return (
    <>
      <Header settings={settings} navBrands={navBrands} navCategories={navCategories} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-[var(--c-muted)] mb-6 flex items-center gap-2 flex-wrap">
          <a href="/"         className="hover:text-[var(--c-link)]">الرئيسية</a>
          <span>›</span>
          <a href="/products" className="hover:text-[var(--c-link)]">المنتجات</a>
          {product.category && (
            <>
              <span>›</span>
              <a href={`/products?category=${product.category.slug}`} className="hover:text-[var(--c-link)]">
                {product.category.name_ar}
              </a>
            </>
          )}
          <span>›</span>
          <span className="text-[var(--c-text)] truncate max-w-[200px]">{product.name_ar}</span>
        </nav>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-[var(--c-surface)] border border-[var(--c-border)] aspect-square relative">
            {product.main_image_url ? (
              <Image
                src={product.main_image_url}
                alt={product.name_ar}
                fill
                className="object-contain p-8"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">📱</div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {product.brand && (
              <a href={`/products?brand=${product.brand.slug}`}
                className="text-sm text-[var(--c-link)] font-semibold num-latin hover:underline w-fit">
                {product.brand.name}
              </a>
            )}

            <h1 className="font-display font-bold text-2xl text-[var(--c-text)] leading-snug">
              {product.name_ar}
            </h1>

            {product.rating !== null && (
              <StarRating rating={product.rating} count={product.review_count} size="md" />
            )}

            {product.bought_recently > 0 && (
              <p className="text-xs text-[var(--c-muted)]">
                تم شراء <span className="font-semibold num-latin text-[var(--c-text)]">{product.bought_recently}+</span> في الشهر الماضي
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap py-3 border-y border-[var(--c-border)]">
              <span className="text-3xl font-black text-[var(--c-price)] num-latin ltr-value">
                {product.price.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-[var(--c-muted)]">{product.currency}</span>
              {product.old_price && (
                <>
                  <span className="text-base text-[var(--c-muted)] line-through num-latin ltr-value">
                    {product.old_price.toLocaleString()}
                  </span>
                  {product.discount_percent && (
                    <span className="text-sm font-bold text-[var(--c-price-deal)] num-latin ltr-value">
                      وفّر {(product.old_price - product.price).toLocaleString()} MRU
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Stock */}
            <p className={`text-sm font-bold ${product.stock_status === 'in_stock' ? 'text-[var(--c-success)]' : 'text-[var(--c-danger)]'}`}>
              {product.stock_status === 'in_stock' ? '✓ متوفر في المخزون' : '✗ غير متوفر حالياً'}
            </p>

            {/* Quick spec tags */}
            {(product.storage || product.ram || product.color || product.warranty || product.condition !== 'new') && (
              <div className="flex flex-wrap gap-2">
                {product.condition !== 'new' && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
                    {product.condition === 'used' ? 'مستعمل' : 'متجدد'}
                  </span>
                )}
                {product.storage && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text)] num-latin">
                    💾 {product.storage}
                  </span>
                )}
                {product.ram && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text)] num-latin">
                    ⚡ {product.ram}
                  </span>
                )}
                {product.color && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text)]">
                    🎨 {product.color}
                  </span>
                )}
                {product.warranty && (
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--c-surface-2)] border border-[var(--c-border)] text-[var(--c-text)]">
                    🛡️ {product.warranty}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description_ar && (
              <p className="text-sm text-[var(--c-muted)] leading-relaxed">
                {product.description_ar}
              </p>
            )}

            {/* WhatsApp CTA */}
            <WhatsAppOrderButton
              productId={product.id}
              waUrl={waUrl}
              message={waMessage}
              className="mt-auto flex items-center justify-center gap-3 wa-grad text-white font-bold py-4 rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-green-500/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              اطلب عبر واتساب الآن
            </WhatsAppOrderButton>

            {/* Share */}
            <p className="text-center text-xs text-[var(--c-muted)]">
              الطلب يتم عبر واتساب فقط — سريع وآمن 🔒
            </p>
          </div>
        </div>

        {/* Specs table */}
        {product.specs.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display font-bold text-lg text-[var(--c-text)] mb-4 pb-2 border-b border-[var(--c-border)]">
              المواصفات الكاملة
            </h2>
            <div className="rounded-xl border border-[var(--c-border)] overflow-hidden">
              {product.specs.map((spec, i) => (
                <div
                  key={spec.id}
                  className={`flex items-center gap-4 px-5 py-3 text-sm ${
                    i % 2 === 0 ? 'bg-[var(--c-surface)]' : 'bg-[var(--c-surface-2)]'
                  }`}
                >
                  <span className="font-semibold text-[var(--c-muted)] w-36 shrink-0">{spec.spec_name}</span>
                  <span className="text-[var(--c-text)] num-latin">{spec.spec_value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-lg text-[var(--c-text)] mb-5 pb-2 border-b border-[var(--c-border)]">
              منتجات ذات صلة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} whatsappNumber={settings.whatsapp_number} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer settings={settings} />
      <FloatingWhatsApp phone={settings.whatsapp_number} />
    </>
  );
}
