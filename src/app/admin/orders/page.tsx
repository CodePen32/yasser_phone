'use client';

import React, { useState, useEffect, useCallback } from 'react';

export const dynamic = 'force-dynamic';

type OrderStatus = 'new' | 'contacted' | 'completed' | 'cancelled';

interface Order {
  id:             number;
  product_id:     number | null;
  customer_name:  string | null;
  customer_phone: string | null;
  message:        string | null;
  status:         string;
  created_at:     string;
  product: {
    id:       number;
    name_ar:  string;
    price:    number | string;
    currency: string;
    slug:     string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  new:       'جديد',
  contacted: 'تم التواصل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
};

const STATUS_COLOR: Record<string, React.CSSProperties> = {
  new:       { background: '#dbeafe', color: '#1d4ed8' },
  contacted: { background: '#fef9c3', color: '#92400e' },
  completed: { background: '#dcfce7', color: '#166534' },
  cancelled: { background: '#fee2e2', color: '#991b1b' },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ar-MA', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtPrice(price: number | string, currency: string) {
  return `${Number(price).toLocaleString()} ${currency}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const th: React.CSSProperties = {
  padding: '0.7rem 1rem', textAlign: 'right', fontSize: '0.78rem',
  fontWeight: 700, color: '#6b7280', whiteSpace: 'nowrap',
  background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
};
const td: React.CSSProperties = {
  padding: '0.65rem 1rem', fontSize: '0.82rem', color: '#374151',
  verticalAlign: 'top', borderBottom: '1px solid #f3f4f6',
};

// ─── Status badge + dropdown ──────────────────────────────────────────────────

function StatusCell({ order, onChanged }: { order: Order; onChanged: (id: number, s: string) => void }) {
  const [busy, setBusy] = useState(false);

  const change = async (next: string) => {
    setBusy(true);
    const res = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) onChanged(order.id, next);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{
        ...STATUS_COLOR[order.status] ?? STATUS_COLOR.new,
        padding: '0.2rem 0.6rem', borderRadius: '999px',
        fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap',
      }}>
        {STATUS_LABEL[order.status] ?? order.status}
      </span>
      <select
        disabled={busy}
        value={order.status}
        onChange={e => change(e.target.value)}
        style={{
          fontSize: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px',
          padding: '0.15rem 0.4rem', background: '#fff', cursor: 'pointer',
          color: '#374151',
        }}
      >
        {Object.entries(STATUS_LABEL).map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<string>('all');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/orders');
    const json = await res.json();
    setOrders(json.orders ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (id: number, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  // Count badges
  const counts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>
          📋 طلبات واتساب
        </h1>
        <button
          onClick={load}
          style={{ padding: '0.45rem 1rem', background: '#f3f4f6', border: '1px solid #d1d5db',
            borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', color: '#374151', fontWeight: 600 }}
        >
          تحديث
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[['all', 'الكل'], ...Object.entries(STATUS_LABEL)].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            style={{
              padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.8rem',
              fontWeight: 600, cursor: 'pointer', border: '1px solid',
              background: filter === v ? '#f59e0b' : '#fff',
              color:      filter === v ? '#fff'    : '#6b7280',
              borderColor: filter === v ? '#f59e0b' : '#d1d5db',
            }}
          >
            {l}
            {v !== 'all' && counts[v] ? ` (${counts[v]})` : ''}
            {v === 'all' ? ` (${orders.length})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>جارٍ التحميل…</div>
      ) : visible.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af', background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb' }}>
          لا توجد طلبات
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>#</th>
                <th style={th}>المنتج</th>
                <th style={th}>السعر</th>
                <th style={th}>الرسالة</th>
                <th style={th}>العميل</th>
                <th style={th}>الحالة</th>
                <th style={th}>التاريخ</th>
                <th style={th}>واتساب</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order, i) => (
                <tr key={order.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  {/* # */}
                  <td style={{ ...td, color: '#9ca3af', fontWeight: 600 }}>#{order.id}</td>

                  {/* Product */}
                  <td style={td}>
                    {order.product ? (
                      <a href={`/products/${order.product.slug}`} target="_blank" rel="noopener noreferrer"
                        style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: '0.82rem' }}>
                        {order.product.name_ar}
                      </a>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>—</span>
                    )}
                  </td>

                  {/* Price */}
                  <td style={{ ...td, whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }}>
                    {order.product
                      ? fmtPrice(order.product.price, order.product.currency)
                      : <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>

                  {/* Message */}
                  <td style={{ ...td, maxWidth: 260 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.78rem', color: '#6b7280' }}>
                      {order.message ?? '—'}
                    </span>
                  </td>

                  {/* Customer */}
                  <td style={td}>
                    {order.customer_name && <div style={{ fontWeight: 600 }}>{order.customer_name}</div>}
                    {order.customer_phone && <div style={{ color: '#6b7280', direction: 'ltr' }}>{order.customer_phone}</div>}
                    {!order.customer_name && !order.customer_phone && <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>

                  {/* Status */}
                  <td style={td}>
                    <StatusCell order={order} onChanged={handleStatusChange} />
                  </td>

                  {/* Date */}
                  <td style={{ ...td, whiteSpace: 'nowrap', color: '#6b7280', fontSize: '0.75rem' }}>
                    {fmtDate(order.created_at)}
                  </td>

                  {/* WhatsApp follow-up */}
                  <td style={td}>
                    {order.message && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(order.message)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          padding: '0.3rem 0.65rem', background: '#25d366', color: '#fff',
                          borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700,
                          textDecoration: 'none', whiteSpace: 'nowrap',
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 13, height: 13 }}>
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        متابعة
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
