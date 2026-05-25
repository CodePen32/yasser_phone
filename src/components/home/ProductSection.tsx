import Link from 'next/link';
import type { Product } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';

interface ProductSectionProps {
  title:            string;
  subtitle?:        string;
  products:         Product[];
  viewAllHref?:     string;
  viewAllLabel?:    string;
  whatsappNumber:   string;
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref = '/products',
  viewAllLabel = 'عرض الكل',
  whatsappNumber,
}: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 pb-3 border-b border-[var(--c-border)]">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--c-text)]">{title}</h2>
          {subtitle && <p className="text-sm text-[var(--c-muted)] mt-0.5">{subtitle}</p>}
        </div>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-[var(--c-link)] hover:text-[var(--c-link-hover)] transition-colors shrink-0"
        >
          {viewAllLabel} ←
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} whatsappNumber={whatsappNumber} />
        ))}
      </div>
    </section>
  );
}
