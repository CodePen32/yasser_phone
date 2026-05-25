import Link from 'next/link';
import type { Category } from '@/types';

const CATEGORY_ICONS: Record<string, string> = {
  phones:      '📱',
  audio:       '🎧',
  watches:     '⌚',
  chargers:    '🔌',
  accessories: '🎒',
  powerbanks:  '🔋',
  cases:       '🛡️',
  cables:      '🔗',
};

interface CategoryStripProps {
  categories: Category[];
}

export function CategoryStrip({ categories }: CategoryStripProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-[var(--c-text)]">
          تسوق حسب القسم
        </h2>
        <Link href="/products" className="text-sm text-[var(--c-link)] hover:text-[var(--c-link-hover)] transition-colors">
          عرض الكل ←
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-md"
              style={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)' }}
            >
              {CATEGORY_ICONS[cat.slug] ?? '📦'}
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-[var(--c-text)] text-center max-w-[70px] leading-tight">
              {cat.name_ar}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
