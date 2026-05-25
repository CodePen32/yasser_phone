'use client';

import React, { useState, useEffect, useRef } from 'react';

export const dynamic = 'force-dynamic';

interface Settings {
  id:               number | null;
  store_name:       string;
  slogan:           string;
  logo_url:         string;
  favicon_url:      string;
  whatsapp_number:  string;
  phone:            string;
  email:            string;
  address:          string;
  city:             string;
  currency:         string;
  facebook_url:     string;
  instagram_url:    string;
  tiktok_url:       string;
}

const EMPTY: Settings = {
  id: null, store_name: '', slogan: '', logo_url: '', favicon_url: '',
  whatsapp_number: '', phone: '', email: '', address: '', city: '',
  currency: '', facebook_url: '', instagram_url: '', tiktok_url: '',
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
  padding: '1.5rem', marginBottom: '1.5rem',
};
const sectionTitle: React.CSSProperties = {
  fontSize: '0.95rem', fontWeight: 700, color: '#111827',
  marginBottom: '1.25rem', paddingBottom: '0.5rem',
  borderBottom: '1px solid #f3f4f6',
};
const label: React.CSSProperties = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600,
  color: '#374151', marginBottom: '0.35rem',
};
const input: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: '7px', fontSize: '0.875rem', color: '#111827',
  outline: 'none', boxSizing: 'border-box',
};
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem',
};
const btnSave: React.CSSProperties = {
  padding: '0.6rem 2rem', background: '#f59e0b', color: '#fff',
  border: 'none', borderRadius: '8px', fontWeight: 700,
  fontSize: '0.9rem', cursor: 'pointer',
};
const btnUpload: React.CSSProperties = {
  padding: '0.4rem 0.9rem', background: '#f3f4f6', color: '#374151',
  border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '0.8rem',
  cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
};

// ─── ImageField sub-component ─────────────────────────────────────────────────

function ImageField({
  fieldLabel, value, onChange,
}: { fieldLabel: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setErr(''); setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('subdir', 'store');
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    const json = await res.json();
    setUploading(false);
    if (!res.ok) { setErr(json.error ?? 'خطأ في الرفع'); return; }
    onChange(json.url);
    if (ref.current) ref.current.value = '';
  };

  return (
    <div>
      <label style={label}>{fieldLabel}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          style={{ ...input, flex: 1, minWidth: 0 }}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://... أو /uploads/store/..."
        />
        <button type="button" style={btnUpload} disabled={uploading}
          onClick={() => ref.current?.click()}>
          {uploading ? 'جارٍ الرفع…' : 'رفع صورة'}
        </button>
        <input ref={ref} type="file" accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); }} />
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ marginTop: '0.5rem', height: 48, objectFit: 'contain', borderRadius: 6, border: '1px solid #e5e7eb' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
      {err && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.3rem' }}>{err}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(data => {
        setForm({
          id:               data.id   ?? null,
          store_name:       data.store_name       ?? '',
          slogan:           data.slogan           ?? '',
          logo_url:         data.logo_url         ?? '',
          favicon_url:      data.favicon_url      ?? '',
          whatsapp_number:  data.whatsapp_number  ?? '',
          phone:            data.phone            ?? '',
          email:            data.email            ?? '',
          address:          data.address          ?? '',
          city:             data.city             ?? '',
          currency:         data.currency         ?? '',
          facebook_url:     data.facebook_url     ?? '',
          instagram_url:    data.instagram_url    ?? '',
          tiktok_url:       data.tiktok_url       ?? '',
        });
        setLoading(false);
      });
  }, []);

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) { setError(json.error ?? 'حدث خطأ'); return; }
    setSuccess('تم حفظ الإعدادات بنجاح ✓');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (loading) return <div style={{ padding: '2rem', color: '#6b7280' }}>جارٍ التحميل…</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>
        ⚙️ إعدادات المتجر
      </h1>

      {success && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 600 }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b',
          borderRadius: 8, padding: '0.75rem 1rem', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── المعلومات الأساسية ── */}
        <div style={card}>
          <div style={sectionTitle}>المعلومات الأساسية</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={label}>اسم المتجر *</label>
              <input style={input} value={form.store_name} onChange={set('store_name')} required />
            </div>
            <div>
              <label style={label}>الشعار (Slogan)</label>
              <input style={input} value={form.slogan} onChange={set('slogan')} placeholder="Premium Mobile Store" />
            </div>
            <div style={grid2}>
              <div>
                <label style={label}>العملة</label>
                <input style={input} value={form.currency} onChange={set('currency')} placeholder="MRU" />
              </div>
              <div>
                <label style={label}>المدينة</label>
                <input style={input} value={form.city} onChange={set('city')} placeholder="نواكشوط" />
              </div>
            </div>
          </div>
        </div>

        {/* ── الشعار والأيقونة ── */}
        <div style={card}>
          <div style={sectionTitle}>الشعار والأيقونة</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ImageField fieldLabel="شعار المتجر (Logo)" value={form.logo_url}
              onChange={url => setForm(f => ({ ...f, logo_url: url }))} />
            <ImageField fieldLabel="Favicon" value={form.favicon_url}
              onChange={url => setForm(f => ({ ...f, favicon_url: url }))} />
          </div>
        </div>

        {/* ── معلومات التواصل ── */}
        <div style={card}>
          <div style={sectionTitle}>معلومات التواصل</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={label}>رقم واتساب * (بدون + مثال: 22232816779)</label>
              <input style={input} value={form.whatsapp_number} onChange={set('whatsapp_number')}
                required placeholder="22232816779" dir="ltr" />
            </div>
            <div style={grid2}>
              <div>
                <label style={label}>رقم الهاتف</label>
                <input style={input} value={form.phone} onChange={set('phone')} dir="ltr" placeholder="+222 32 81 67 79" />
              </div>
              <div>
                <label style={label}>البريد الإلكتروني</label>
                <input style={input} value={form.email} onChange={set('email')} dir="ltr" type="email" placeholder="info@yasserphone.mr" />
              </div>
            </div>
            <div>
              <label style={label}>العنوان</label>
              <input style={input} value={form.address} onChange={set('address')} placeholder="شارع العاصمة، نواكشوط" />
            </div>
          </div>
        </div>

        {/* ── روابط التواصل الاجتماعي ── */}
        <div style={card}>
          <div style={sectionTitle}>روابط التواصل الاجتماعي</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={label}>فيسبوك</label>
              <input style={input} value={form.facebook_url} onChange={set('facebook_url')} dir="ltr" placeholder="https://facebook.com/..." />
            </div>
            <div>
              <label style={label}>إنستغرام</label>
              <input style={input} value={form.instagram_url} onChange={set('instagram_url')} dir="ltr" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label style={label}>تيك توك</label>
              <input style={input} value={form.tiktok_url} onChange={set('tiktok_url')} dir="ltr" placeholder="https://tiktok.com/..." />
            </div>
          </div>
        </div>

        <button type="submit" style={btnSave} disabled={saving}>
          {saving ? 'جارٍ الحفظ…' : 'حفظ الإعدادات'}
        </button>
      </form>
    </div>
  );
}
