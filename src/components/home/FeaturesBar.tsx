const FEATURES = [
  {
    title: 'ضمان حقيقي',
    desc:  'على جميع المنتجات الأصلية',
    color: '#2563eb',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    title: 'توصيل سريع',
    desc:  'في نواكشوط خلال 24 ساعة',
    color: '#16a34a',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
  },
  {
    title: 'دعم 24/7',
    desc:  'خدمة عملاء عبر واتساب',
    color: '#25D366',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h8M8 14h5"/>
      </svg>
    ),
  },
  {
    title: 'منتجات أصلية',
    desc:  'مستوردة ومضمونة 100%',
    color: '#d97706',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
];

export function FeaturesBar() {
  return (
    <section className="bg-[var(--c-surface)] border-y border-[var(--c-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3 sm:gap-4">
              {/* Icon badge */}
              <div
                className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${f.color}18`, color: f.color }}
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6">{f.icon}</div>
              </div>
              {/* Text */}
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-[var(--c-text)] leading-snug">{f.title}</div>
                <div className="text-[10px] sm:text-xs text-[var(--c-muted)] leading-snug mt-0.5 line-clamp-2">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
