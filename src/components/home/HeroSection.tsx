import Image from 'next/image';
import type { StoreSettings, Product } from '@/types';

interface HeroSectionProps {
  settings:         StoreSettings;
  featuredProducts?: Product[];
}

// Fallback card data when no real products are available
const FALLBACK_CARDS = [
  { label: 'آيفون 15 Pro',  sub: 'متوفر الآن',     color: '#1c1c2e', href: '/products?brand=apple' },
  { label: 'Apple Watch',   sub: 'ساعات ذكية',      color: '#1a2a1a', href: '/products?category=smartwatches' },
  { label: 'AirPods Pro',   sub: 'سماعات أصلية',    color: '#1a1a2e', href: '/products?category=headphones' },
  { label: 'باور بانك',     sub: 'شحن سريع',        color: '#2a1a1a', href: '/products?category=powerbank' },
];

export function HeroSection({ settings, featuredProducts = [] }: HeroSectionProps) {
  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن عروضكم')}`;

  // Pick up to 4 products with an image, fallback to plain cards for the rest
  const withImage  = featuredProducts.filter((p) => p.main_image_url).slice(0, 4);
  const cardCount  = 4;
  const cards = Array.from({ length: cardCount }, (_, i) => {
    const product = withImage[i];
    if (product) {
      return {
        key:       String(product.id),
        label:     product.name_ar,
        sub:       product.brand?.name ?? '',
        imageUrl:  product.main_image_url!,
        href:      `/products/${product.slug}`,
        color:     '#1c2233',
      };
    }
    const fb = FALLBACK_CARDS[i];
    return { key: fb.label, label: fb.label, sub: fb.sub, imageUrl: null, href: fb.href, color: fb.color };
  });

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1a2a3a 40%, #0f2744 100%)',
        minHeight: '260px',
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

      <div className="relative z-10 max-w-[1500px] mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row-reverse items-center gap-6 md:gap-8">

        {/* Product showcase cards — right on desktop, below text on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 shrink-0 w-full md:w-72 lg:w-80">
          {cards.map((card) => (
            <a
              key={card.key}
              href={card.href}
              className="rounded-xl overflow-hidden relative flex flex-col items-center justify-end aspect-square hover:opacity-90 transition-opacity"
              style={{ background: card.color, border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {card.imageUrl ? (
                <Image
                  src={card.imageUrl}
                  alt={card.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 45vw, 155px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" className="w-10 h-10">
                    <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
                  </svg>
                </div>
              )}
              {/* label overlay */}
              <div className="relative z-10 w-full px-2 py-1.5 text-center" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
                <div className="text-white text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1">{card.label}</div>
                {card.sub && <div className="text-[9px] sm:text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.55)' }}>{card.sub}</div>}
              </div>
            </a>
          ))}
        </div>

        {/* Text + CTA */}
        <div className="flex-1 text-center md:text-end w-full">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{ background: 'rgba(245,159,11,0.15)', border: '1px solid rgba(245,159,11,0.35)', color: '#fbbf24' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            عروض هذا الأسبوع
          </div>

          <h1
            className="font-display font-black leading-tight mb-3"
            style={{ color: 'white', fontSize: 'clamp(1.5rem, 3.5vw, 2.4rem)' }}
          >
            عروض الهواتف في {settings.city}
          </h1>

          <p className="text-sm mb-4 max-w-sm mx-auto md:mr-0 md:ml-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
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
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--c-bg-page))' }}
      />
    </section>
  );
}
