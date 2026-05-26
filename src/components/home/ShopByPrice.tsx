import Image from 'next/image';
import { getShopByPriceSections } from '@/lib/db';
import type { ShopByPriceSection } from '@/lib/db';

const ITEM_COLORS = ['#e8f4fd', '#f0f0f5', '#f0f9ff', '#f5f0ff', '#fff0f0', '#f0fff0', '#fffbeb', '#f0fdf4'];

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
                className="rounded-lg flex items-center justify-center aspect-square"
                style={{ background: ITEM_COLORS[(index * 2 + i) % ITEM_COLORS.length] }}
              />
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
      </div>
    </section>
  );
}
