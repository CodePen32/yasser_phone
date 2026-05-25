import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function getStats() {
  const [
    totalProducts,
    activeProducts,
    totalCategories,
    totalBrands,
    featuredCount,
    offerCount,
    latestProducts,
    settings,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { is_active: true } }),
    prisma.category.count({ where: { is_active: true } }),
    prisma.brand.count({ where: { is_active: true } }),
    prisma.product.count({ where: { is_featured: true, is_active: true } }),
    prisma.product.count({ where: { is_offer: true, is_active: true } }),
    prisma.product.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        name_ar: true,
        price: true,
        is_active: true,
        category: { select: { name_ar: true } },
      },
    }),
    prisma.storeSettings.findFirst(),
  ]);

  return { totalProducts, activeProducts, totalCategories, totalBrands, featuredCount, offerCount, latestProducts, settings };
}

const statCardStyle = (color: string) => ({
  background: '#fff',
  borderRadius: '8px',
  padding: '1.25rem 1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  borderTop: `3px solid ${color}`,
});

export default async function AdminDashboard() {
  const { totalProducts, activeProducts, totalCategories, totalBrands, featuredCount, offerCount, latestProducts, settings } = await getStats();

  const stats = [
    { label: 'إجمالي المنتجات',   value: totalProducts,   color: '#131921' },
    { label: 'منتجات نشطة',       value: activeProducts,   color: '#16a34a' },
    { label: 'التصنيفات',         value: totalCategories,  color: '#2563eb' },
    { label: 'الماركات',          value: totalBrands,      color: '#7c3aed' },
    { label: 'منتجات مميزة',      value: featuredCount,    color: '#f59e0b' },
    { label: 'عروض نشطة',         value: offerCount,       color: '#b12704' },
  ];

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>
        لوحة التحكم
      </h1>

      {/* Stats grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={statCardStyle(s.color)}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Latest products */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f3f4f6',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
            }}
          >
            آخر 5 منتجات مضافة
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>المنتج</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>التصنيف</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left',  color: '#6b7280', fontWeight: 500 }}>السعر</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'center', color: '#6b7280', fontWeight: 500 }}>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {latestProducts.map((p, i) => (
                <tr
                  key={p.id}
                  style={{ borderTop: i > 0 ? '1px solid #f3f4f6' : 'none' }}
                >
                  <td style={{ padding: '0.65rem 1rem', color: '#111827' }}>{p.name_ar}</td>
                  <td style={{ padding: '0.65rem 1rem', color: '#6b7280' }}>{p.category?.name_ar ?? '—'}</td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'left', color: '#b12704', fontWeight: 600 }}>
                    {Number(p.price).toLocaleString('ar-MR')} MRU
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        background: p.is_active ? '#dcfce7' : '#fee2e2',
                        color: p.is_active ? '#16a34a' : '#b91c1c',
                      }}
                    >
                      {p.is_active ? 'نشط' : 'مخفي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Store settings summary */}
        <div
          style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #f3f4f6',
              fontWeight: 600,
              color: '#111827',
              fontSize: '0.95rem',
            }}
          >
            إعدادات المتجر
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            {settings ? (
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.6rem 1rem', fontSize: '0.875rem', margin: 0 }}>
                {[
                  ['اسم المتجر',  settings.store_name],
                  ['المدينة',     settings.city],
                  ['الهاتف',      settings.phone],
                  ['واتساب',      settings.whatsapp_number],
                  ['البريد',      settings.email ?? '—'],
                ].map(([k, v]) => (
                  <>
                    <dt key={`k-${k}`} style={{ color: '#6b7280', whiteSpace: 'nowrap' }}>{k}:</dt>
                    <dd key={`v-${k}`} style={{ margin: 0, color: '#111827', fontWeight: 500, direction: 'ltr', textAlign: 'right' }}>{v}</dd>
                  </>
                ))}
              </dl>
            ) : (
              <p style={{ color: '#9ca3af', textAlign: 'center' }}>لا توجد إعدادات</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
