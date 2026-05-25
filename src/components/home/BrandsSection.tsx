import Link from 'next/link';
import type { Brand } from '@/types';

interface BrandsSectionProps {
  brands: Brand[];
}

export function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="bg-[var(--c-surface)] border-y border-[var(--c-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display font-bold text-lg text-[var(--c-text)] mb-5 text-center">
          أفضل الماركات
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brand=${brand.slug}`}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:shadow-md hover:scale-105 num-latin"
              style={{
                background: 'var(--c-surface-2)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-text)',
              }}
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
