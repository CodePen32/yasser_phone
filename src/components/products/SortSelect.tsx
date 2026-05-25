'use client';

interface Props {
  current?: string;
  q?:        string;
  category?: string;
  brand?:    string;
  featured?: string;
  offer?:    string;
}

export function SortSelect({ current, q, category, brand, featured, offer }: Props) {
  return (
    <form method="get" className="hidden sm:block">
      {q        && <input type="hidden" name="q"        value={q} />}
      {category && <input type="hidden" name="category" value={category} />}
      {brand    && <input type="hidden" name="brand"    value={brand} />}
      {featured && <input type="hidden" name="featured" value={featured} />}
      {offer    && <input type="hidden" name="offer"    value={offer} />}
      <select
        name="sort"
        defaultValue={current ?? 'newest'}
        onChange={(e) => (e.currentTarget.form as HTMLFormElement).submit()}
        className="text-sm border border-[var(--c-border)] rounded-lg px-3 py-1.5 bg-[var(--c-surface)] text-[var(--c-text)] outline-none focus:border-[var(--c-accent)]"
      >
        <option value="newest">الأحدث</option>
        <option value="price_low">السعر: من الأقل</option>
        <option value="price_high">السعر: من الأعلى</option>
        <option value="popular">الأكثر شعبية</option>
      </select>
    </form>
  );
}
