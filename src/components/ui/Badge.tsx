type BadgeVariant = 'sale' | 'new' | 'best_seller' | 'exclusive' | 'used' | 'refurbished';

const BADGE_STYLES: Record<BadgeVariant, string> = {
  sale:        'bg-[var(--c-price-deal)] text-white',
  new:         'bg-blue-600 text-white',
  best_seller: 'bg-amber-500 text-white',
  exclusive:   'bg-purple-600 text-white',
  used:        'bg-gray-500 text-white',
  refurbished: 'bg-teal-600 text-white',
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  sale:        'تخفيض',
  new:         'جديد',
  best_seller: 'الأكثر مبيعاً',
  exclusive:   'حصري',
  used:        'مستعمل',
  refurbished: 'متجدد',
};

interface BadgeProps {
  variant: BadgeVariant;
  className?: string;
}

export function Badge({ variant, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${BADGE_STYLES[variant]} ${className}`}
    >
      {BADGE_LABELS[variant]}
    </span>
  );
}
