interface ShopByPriceProps {
  whatsappNumber: string;
}

const CARDS = [
  {
    title:  'آخر الموديلات في الجوالات',
    href:   '/products?category=phones',
    bg:     '#fff',
    items: [
      { label: 'سامسونج جالاكسي S24 الترا', emoji: '📱', color: '#e8f4fd' },
      { label: 'آيفون 16 برو ماكس',          emoji: '📱', color: '#f0f0f5' },
    ],
  },
  {
    title:  'تسوق حسب السعر',
    href:   '/products',
    bg:     '#fff',
    items: [
      { label: 'أقل من 5,000 MRU',     emoji: '💰', color: '#fffbeb' },
      { label: '5,000 - 15,000 MRU',   emoji: '💎', color: '#fef3c7' },
    ],
  },
  {
    title:  'اكتشف السماعات',
    href:   '/products?category=audio',
    bg:     '#fff',
    items: [
      { label: 'سامسونج جالاكسي بادز 3 برو', emoji: '🎧', color: '#f0f9ff' },
      { label: 'ايربودز برو 2',              emoji: '🎧', color: '#f5f0ff' },
    ],
  },
  {
    title:  'إكسسوارات وشواحن',
    href:   '/products?category=accessories',
    bg:     '#fff',
    items: [
      { label: 'كفر iPhone 15 Pro Max جلد', emoji: '🛡️', color: '#fff0f0' },
      { label: 'باور بانك Anker 20000mAh', emoji: '🔋', color: '#f0fff0' },
    ],
  },
];

export function ShopByPrice({ whatsappNumber: _ }: ShopByPriceProps) {
  return (
    <section className="max-w-[1500px] mx-auto px-3 sm:px-4 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            style={{ background: card.bg, border: '1px solid #e0e0e0' }}
          >
            {/* Card header */}
            <div className="px-4 pt-4 pb-2">
              <h3 className="font-display font-bold text-sm text-[var(--c-text)] leading-snug">
                {card.title}
              </h3>
            </div>

            {/* 2-col product preview */}
            <div className="grid grid-cols-2 gap-2 px-3 pb-3">
              {card.items.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg p-3 flex flex-col items-center justify-center gap-1 aspect-square"
                  style={{ background: item.color }}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[10px] text-center text-[var(--c-muted)] leading-tight line-clamp-2">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-4 pb-4">
              <span className="text-xs font-semibold text-[var(--c-link)] hover:underline">
                عرض الكل ←
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
