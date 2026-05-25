'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductRow {
  id: number;
  name_ar: string;
  slug: string;
  price: string | number;
  old_price: string | number | null;
  discount_percent: number | null;
  main_image_url: string | null;
  condition: string;
  stock_status: string;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
  created_at: string;
  category: { id: number; name_ar: string } | null;
  brand: { id: number; name: string } | null;
  images: { image_url: string }[];
}

interface CategoryOption { id: number; name_ar: string }
interface BrandOption    { id: number; name: string }

interface Props {
  categories: CategoryOption[];
  brands: BrandOption[];
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  overflow: 'hidden',
};

const inputStyle: React.CSSProperties = {
  padding: '0.45rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.875rem',
  background: '#fff',
  color: '#111827',
  outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.45rem 1rem',
  background: '#131921',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.875rem',
  textDecoration: 'none',
  display: 'inline-block',
};

const btnDanger: React.CSSProperties = {
  padding: '0.3rem 0.65rem',
  background: '#fee2e2',
  color: '#b91c1c',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
};

const btnEdit: React.CSSProperties = {
  padding: '0.3rem 0.65rem',
  background: '#eff6ff',
  color: '#2563eb',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  textDecoration: 'none',
  display: 'inline-block',
};

const badge = (bg: string, color: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.15rem 0.5rem',
  borderRadius: '999px',
  fontSize: '0.7rem',
  background: bg,
  color,
  fontWeight: 600,
});

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductsClient({ categories, brands }: Props) {
  const [products, setProducts]       = useState<ProductRow[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const perPage                       = 20;
  const [loading, setLoading]         = useState(false);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  // Filters
  const [q, setQ]                     = useState('');
  const [catId, setCatId]             = useState('');
  const [brandId, setBrandId]         = useState('');
  const [filterOffer, setFilterOffer] = useState('');
  const [filterFeat, setFilterFeat]   = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [filterCond, setFilterCond]   = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(pg), per_page: String(perPage) });
    if (q)           params.set('q', q);
    if (catId)       params.set('category_id', catId);
    if (brandId)     params.set('brand_id', brandId);
    if (filterOffer) params.set('is_offer', filterOffer);
    if (filterFeat)  params.set('is_featured', filterFeat);
    if (filterActive)params.set('is_active', filterActive);
    if (filterCond)  params.set('condition', filterCond);

    try {
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await res.json() as { products: ProductRow[]; total: number };
      setProducts(data.products);
      setTotal(data.total);
      setPage(pg);
    } finally {
      setLoading(false);
    }
  }, [q, catId, brandId, filterOffer, filterFeat, filterActive, filterCond]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' });
    setDeleteId(null);
    if (res.ok) { showToast('تم حذف المنتج'); fetchProducts(page); }
    else        { showToast('فشل الحذف', false); }
  };

  const handleToggle = async (id: number) => {
    const res = await fetch(`/api/admin/products/${id}/toggle`, { method: 'PATCH' });
    if (res.ok) {
      const data = await res.json() as { product: { id: number; is_active: boolean } };
      setProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, is_active: data.product.is_active } : p)
      );
    } else {
      showToast('فشل تغيير الحالة', false);
    }
  };

  const totalPages = Math.ceil(total / perPage);

  const conditionLabel = (c: string) =>
    c === 'new' ? 'جديد' : c === 'used' ? 'مستعمل' : c === 'refurbished' ? 'مجدد' : c;

  const stockLabel = (s: string) =>
    s === 'in_stock' ? 'متوفر' : s === 'out_of_stock' ? 'نفذ' : 'محدود';

  const thumbUrl = (p: ProductRow) =>
    p.main_image_url ?? p.images[0]?.image_url ?? null;

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: '1rem',
            right: '1rem',
            zIndex: 9999,
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            background: toast.ok ? '#16a34a' : '#b91c1c',
            color: '#fff',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5rem 2rem', maxWidth: '360px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', marginBottom: '1.25rem', color: '#111827' }}>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={handleDelete} style={{ ...btnDanger, padding: '0.5rem 1.25rem', fontWeight: 700 }}>
                حذف
              </button>
              <button onClick={() => setDeleteId(null)} style={{ ...inputStyle, cursor: 'pointer' }}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>المنتجات</h1>
        <Link href="/admin/products/new" style={btnPrimary}>+ إضافة منتج</Link>
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <input
            style={{ ...inputStyle, minWidth: '200px', flex: 1 }}
            placeholder="بحث باسم المنتج…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
          />
          <select style={inputStyle} value={catId} onChange={(e) => setCatId(e.target.value)}>
            <option value="">كل التصنيفات</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
          </select>
          <select style={inputStyle} value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            <option value="">كل الماركات</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <select style={inputStyle} value={filterCond} onChange={(e) => setFilterCond(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="new">جديد</option>
            <option value="used">مستعمل</option>
            <option value="refurbished">مجدد</option>
          </select>
          <select style={inputStyle} value={filterOffer} onChange={(e) => setFilterOffer(e.target.value)}>
            <option value="">عرض؟</option>
            <option value="true">عروض فقط</option>
            <option value="false">بدون عروض</option>
          </select>
          <select style={inputStyle} value={filterFeat} onChange={(e) => setFilterFeat(e.target.value)}>
            <option value="">مميز؟</option>
            <option value="true">مميزة فقط</option>
            <option value="false">غير مميزة</option>
          </select>
          <select style={inputStyle} value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">كل الحالات</option>
            <option value="true">نشط</option>
            <option value="false">مخفي</option>
          </select>
          <button style={btnPrimary} onClick={() => fetchProducts(1)}>
            بحث
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>جاري التحميل…</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>لا توجد منتجات</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  {['الصورة','اسم المنتج','السعر','التصنيف','الماركة','الحالة','شارات','الحالة','تاريخ الإضافة','الإجراءات'].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '0.75rem 0.875rem', textAlign: 'right', color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderTop: '1px solid #f3f4f6' }}
                  >
                    {/* Thumbnail */}
                    <td style={{ padding: '0.6rem 0.875rem' }}>
                      {thumbUrl(p) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumbUrl(p)!}
                          alt={p.name_ar}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 50, height: 50, background: '#f3f4f6', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '1.25rem' }}>
                          📦
                        </div>
                      )}
                    </td>
                    {/* Name */}
                    <td style={{ padding: '0.6rem 0.875rem', color: '#111827', fontWeight: 600, maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name_ar}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.75rem', fontWeight: 400 }}>{p.slug}</div>
                    </td>
                    {/* Price */}
                    <td style={{ padding: '0.6rem 0.875rem', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#b12704', fontWeight: 700 }}>{Number(p.price).toLocaleString('ar-MR')} MRU</span>
                      {p.old_price && (
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                          {Number(p.old_price).toLocaleString('ar-MR')} MRU
                        </div>
                      )}
                      {p.discount_percent && (
                        <span style={badge('#fef3c7', '#b45309')}>{p.discount_percent}%</span>
                      )}
                    </td>
                    {/* Category */}
                    <td style={{ padding: '0.6rem 0.875rem', color: '#374151' }}>{p.category?.name_ar ?? '—'}</td>
                    {/* Brand */}
                    <td style={{ padding: '0.6rem 0.875rem', color: '#374151' }}>{p.brand?.name ?? '—'}</td>
                    {/* Condition + stock */}
                    <td style={{ padding: '0.6rem 0.875rem', whiteSpace: 'nowrap' }}>
                      <span style={badge(p.condition === 'new' ? '#dbeafe' : '#fef9c3', p.condition === 'new' ? '#1d4ed8' : '#854d0e')}>
                        {conditionLabel(p.condition)}
                      </span>
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={badge(
                          p.stock_status === 'in_stock' ? '#dcfce7' : p.stock_status === 'out_of_stock' ? '#fee2e2' : '#fef3c7',
                          p.stock_status === 'in_stock' ? '#16a34a' : p.stock_status === 'out_of_stock' ? '#b91c1c' : '#b45309'
                        )}>
                          {stockLabel(p.stock_status)}
                        </span>
                      </div>
                    </td>
                    {/* Badges */}
                    <td style={{ padding: '0.6rem 0.875rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {p.is_offer    && <span style={badge('#fee2e2', '#b91c1c')}>عرض</span>}
                        {p.is_featured && <span style={badge('#fef3c7', '#b45309')}>مميز</span>}
                      </div>
                    </td>
                    {/* Active toggle */}
                    <td style={{ padding: '0.6rem 0.875rem' }}>
                      <button
                        onClick={() => handleToggle(p.id)}
                        style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '999px',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          background: p.is_active ? '#dcfce7' : '#f3f4f6',
                          color: p.is_active ? '#16a34a' : '#6b7280',
                        }}
                      >
                        {p.is_active ? 'نشط' : 'مخفي'}
                      </button>
                    </td>
                    {/* Date */}
                    <td style={{ padding: '0.6rem 0.875rem', color: '#6b7280', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(p.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '0.6rem 0.875rem' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                        <Link href={`/admin/products/${p.id}/edit`} style={btnEdit}>تعديل</Link>
                        <button style={btnDanger} onClick={() => setDeleteId(p.id)}>حذف</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              عرض {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} من {total}
            </span>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button
                disabled={page === 1}
                onClick={() => fetchProducts(page - 1)}
                style={{ ...inputStyle, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                السابق
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => fetchProducts(pg)}
                    style={{
                      ...inputStyle,
                      cursor: 'pointer',
                      background: pg === page ? '#131921' : '#fff',
                      color: pg === page ? '#fff' : '#111827',
                      fontWeight: pg === page ? 700 : 400,
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                disabled={page === totalPages}
                onClick={() => fetchProducts(page + 1)}
                style={{ ...inputStyle, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
