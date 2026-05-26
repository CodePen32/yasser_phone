import Image from 'next/image';
import { getShopByPriceSections } from '@/lib/db';
import type { ShopByPriceSection } from '@/lib/db';

const PRICE_ITEMS = [
  {
    label:    'أقل من 5,000 MRU',
    sublabel: 'اقتصادي',
    color:    '#fffbeb',
    href:     '/products?max_price=5000',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-amber-500">
        <path d="M6 2 3 6l9 14 9-14-3-4Z"/><path d="M3 6h18"/><path d="m12 6 4-4M12 6 8 2"/>
      </svg>
    ),
  },
  {
    label:    '5,000 – 15,000 MRU',
    sublabel: 'ممتاز',
    color:    '#f0fdf4',
    href:     '/products?min_price=5000&max_price=15000',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-emerald-500">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2M12 12v4M10 14h4"/>
      </svg>
    ),
  },
];

const ITEM_COLORS = ['#e8f4fd', '#f0f0f5', '#f0f9ff', '#f5f0ff', '#fff0f0', '#f0fff0'];

function ProductCard({ product, color }: { product: { id: number; name_ar: string; slug: string; main_image_url: string | null }; color: string }) {
  return (
    <div
      className="rounded-lg p-2 flex flex-col items-center justify-center gap-1 aspect-square overflow-hidden relative"
      style={{ background: color }}
    >
      {product.main_image_url ? (
        <Image
          src={product.main_image_url}
          alt={product.name_ar}
          fill
          className="object-cover rounded-lg"
          sizes="(max-width: 640px) 40vw, 140px"
        />
      ) : (
        <span className="text-3xl">📱</span>
      )}
      <span className="absolute bottom-1 right-1 left-1 text-[9px] text-center text-white bg-black/40 rounded px-1 py-0.5 leading-tight line-clamp-1 backdrop-blur-sm">
        {product.name_ar}
      </span>
    </div>
  );
}

function SectionCard({ section, index }: { section: ShopByPriceSection; index: number }) {
  return (
    <a
      href={section.href}
      className="rounded-xl overflow-hidden hover:shadow-md transition-shadow"
      style={{ background: '#fff', border: '1px solid #e0e0e0' }}
    >
      <div className="px-4 pt-4 pb-2">
        <h3 className="font-display font-bold text-sm text-[var(--c-text)] leading-snug">
          {section.title}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        {section.products.length > 0
          ? section.products.map((p, i) => (
              <ProductCard key={p.id} product={p} color={ITEM_COLORS[(index * 2 + i) % ITEM_COLORS.length]} />
            ))
          : [0, 1].map((i) => (
              <div
                key={i}
                className="rounded-lg flex items-center justify-center aspect-square text-3xl"
                style={{ background: ITEM_COLORS[(index * 2 + i) % ITEM_COLORS.length] }}
              >
                📦
              </div>
            ))}
      </div>
      <div className="px-4 pb-4">
        <span className="text-xs font-semibold text-[var(--c-link)] hover:underline">عرض الكل ←</span>
      </div>
    </a>
  );
}

export async function ShopByPrice() {
  const sections = await getShopByPriceSections();

  return (
    <section className="max-w-[1500px] mx-auto px-3 sm:px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((section, i) => (
          <SectionCard key={section.href} section={section} index={i} />
        ))}

        {/* Price range card — kept static */}
        <a
          href="/products"
          className="rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          style={{ background: '#fff', border: '1px solid #e0e0e0' }}
        >
          <div className="px-4 pt-4 pb-2">
            <h3 className="font-display font-bold text-sm text-[var(--c-text)] leading-snug">
              تسوق حسب السعر
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 px-3 pb-3">
            {PRICE_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-square hover:opacity-90 transition-opacity"
                style={{ background: item.color }}
              >
                {item.icon}
                <span className="text-[10px] font-bold text-center text-[var(--c-text)] leading-tight">
                  {item.label}
                </span>
                <span className="text-[9px] text-center text-[var(--c-muted)]">
                  {item.sublabel}
                </span>
              </a>
            ))}
          </div>
          <div className="px-4 pb-4">
            <span className="text-xs font-semibold text-[var(--c-link)] hover:underline">عرض الكل ←</span>
          </div>
        </a>
      </div>
    </section>
  );
}
