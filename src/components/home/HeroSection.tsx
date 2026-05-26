import Image from 'next/image';
import type { StoreSettings, Product } from '@/types';

interface HeroSectionProps {
  settings:          StoreSettings;
  featuredProducts?: Product[];
}

export function HeroSection({ settings, featuredProducts = [] }: HeroSectionProps) {
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن عروضكم')}`;

  // Only products with a real image — max 4
  const cards = featuredProducts
    .filter((p) => p.main_image_url)
    .slice(0, 4);

  const hasCards = cards.length > 0;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2a3a 40%, #0f2744 100%)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className={`relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 py-8 sm:py-10 flex flex-col ${hasCards ? 'md:flex-row' : ''} items-center gap-6 md:gap-10`}>

        {/* ── Text + CTA (right column in RTL) ── */}
        <div className={`flex-1 text-center md:text-end w-full ${hasCards ? 'md:order-2' : ''}`}>
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(245,159,11,0.15)', border: '1px solid rgba(245,159,11,0.35)', color: '#fbbf24' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            عروض هذا الأسبوع
          </div>

          <h1
            className="font-display font-black leading-tight mb-3"
            style={{ color: 'white', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)' }}
          >
            عروض الهواتف في {settings.city}
          </h1>

          <p
            className="text-sm mb-5 max-w-xs mx-auto md:mr-0 md:ml-auto"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            خصومات على iPhone وSamsung وXiaomi. اطلب الآن عبر واتساب واستلم بسرعة.
          </p>

          <div className="flex flex-wrap gap-3 justify-center md:justify-end">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 wa-grad text-white font-bold px-5 py-2.5 rounded-lg text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              اطلب الآن عبر واتساب
            </a>
            <a
              href="/products"
              className="inline-flex items-center gap-2 font-bold px-5 py-2.5 rounded-lg text-sm hover:bg-amber-400/20 transition-colors"
              style={{ background: 'rgba(245,159,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,159,11,0.3)' }}
            >
              تسوق العروض
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Product cards (left column in RTL) — only when there are real images ── */}
        {hasCards && (
          <div className={`grid gap-2 shrink-0 w-full md:order-1 ${
            cards.length === 1 ? 'grid-cols-1 md:w-44' :
            cards.length === 2 ? 'grid-cols-2 md:w-64' :
            cards.length === 3 ? 'grid-cols-3 md:w-80' :
                                 'grid-cols-2 md:w-72 lg:w-80'
          }`}>
            {cards.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-xl overflow-hidden relative flex flex-col items-end justify-end aspect-square hover:opacity-90 transition-opacity"
                style={{ background: '#1c2233', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Image
                  src={product.main_image_url!}
                  alt={product.name_ar}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 155px"
                />
                <div
                  className="relative z-10 w-full px-2 py-1.5 text-center"
                  style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                >
                  <div className="text-white text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1">
                    {product.name_ar}
                  </div>
                  {product.brand?.name && (
                    <div className="text-[9px] sm:text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {product.brand.name}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--c-bg-page))' }}
      />
    </section>
  );
}
