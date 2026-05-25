const FEATURES = [
  { icon: '🛡️', title: 'ضمان حقيقي',     desc: 'على جميع المنتجات الأصلية' },
  { icon: '🚀', title: 'توصيل سريع',     desc: 'في نواكشوط خلال 24 ساعة' },
  { icon: '💬', title: 'دعم 24/7',        desc: 'خدمة عملاء عبر واتساب' },
  { icon: '✅', title: 'منتجات أصلية',   desc: 'مستوردة ومضمونة 100%' },
];

export function FeaturesBar() {
  return (
    <section className="bg-[var(--c-surface)] border-y border-[var(--c-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <span className="text-2xl shrink-0">{f.icon}</span>
              <div>
                <div className="text-sm font-bold text-[var(--c-text)]">{f.title}</div>
                <div className="text-xs text-[var(--c-muted)]">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
