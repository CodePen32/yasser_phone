'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CatalogRow {
  id: number;
  name: string;          // name_ar for categories, name for brands
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order?: number;   // categories only
  product_count: number;
}

export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number';
  dir?: 'ltr' | 'rtl';
}

interface Props {
  title: string;
  addLabel: string;
  apiBase: string;           // e.g. /api/admin/categories
  uploadSubdir: string;      // e.g. "categories" or "brands"
  nameLabel: string;         // "الاسم العربي" or "اسم الماركة"
  nameKey: 'name_ar' | 'name';
  hasSort: boolean;
  fields: FieldDef[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text.trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

async function uploadImg(file: File, subdir: string): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('subdir', subdir);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json() as { url?: string; error?: string };
  if (!res.ok) return { error: data.error ?? 'فشل الرفع' };
  return { url: data.url };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: '#fff', borderRadius: '8px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden',
};

const inp: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.7rem',
  border: '1px solid #d1d5db', borderRadius: '6px',
  fontSize: '0.875rem', color: '#111827', background: '#fff',
  outline: 'none', boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.5rem 1.25rem', background: '#131921', color: '#fff',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
};

const btnDanger: React.CSSProperties = {
  padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#b91c1c',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
};

const btnEdit: React.CSSProperties = {
  padding: '0.3rem 0.65rem', background: '#eff6ff', color: '#2563eb',
  border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem',
};

const btnUpload: React.CSSProperties = {
  padding: '0.35rem 0.75rem', background: '#eff6ff', color: '#2563eb',
  border: '1px dashed #93c5fd', borderRadius: '6px', cursor: 'pointer',
  fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
};

function badge(active: boolean) {
  return {
    display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '999px',
    fontSize: '0.75rem', fontWeight: 600,
    background: active ? '#dcfce7' : '#f3f4f6',
    color: active ? '#16a34a' : '#6b7280',
  } as React.CSSProperties;
}

// ─── Empty form ───────────────────────────────────────────────────────────────

type FormState = {
  name: string; slug: string; image_url: string;
  sort_order: string; is_active: boolean;
};

const EMPTY: FormState = { name: '', slug: '', image_url: '', sort_order: '0', is_active: true };

// ─── Inline form (add / edit) ─────────────────────────────────────────────────

function RowForm({
  initial, nameLabel, hasSort, uploadSubdir, onSave, onCancel, saving,
}: {
  initial: FormState;
  nameLabel: string;
  hasSort: boolean;
  uploadSubdir: string;
  onSave: (data: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm]       = useState<FormState>(initial);
  const [uploading, setUpl]   = useState(false);
  const [uploadErr, setUplErr]= useState('');
  const fileRef               = useRef<HTMLInputElement>(null);
  const [slugManual, setSM]   = useState(!!initial.slug);

  useEffect(() => {
    if (!slugManual && form.name) setForm(f => ({ ...f, slug: toSlug(f.name) }));
  }, [form.name, slugManual]);

  const s = (k: keyof FormState, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpl(true); setUplErr('');
    const result = await uploadImg(file, uploadSubdir);
    setUpl(false);
    if (result.error) { setUplErr(result.error); return; }
    s('image_url', result.url!);
    if (fileRef.current) fileRef.current.value = '';
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSave(form); };

  return (
    <tr style={{ background: '#fffbeb' }}>
      <td colSpan={99} style={{ padding: '1rem 1.25rem' }}>
        <form onSubmit={submit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {/* Name */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:'0.25rem' }}>{nameLabel} *</label>
              <input required style={inp} value={form.name} onChange={e => s('name', e.target.value)} placeholder={nameLabel} />
            </div>
            {/* Slug */}
            <div>
              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:'0.25rem' }}>Slug *</label>
              <input required style={{ ...inp, direction:'ltr' }} value={form.slug}
                onChange={e => { setSM(true); s('slug', e.target.value); }} placeholder="example-slug" />
            </div>
            {/* Sort order */}
            {hasSort && (
              <div>
                <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:'0.25rem' }}>الترتيب</label>
                <input type="number" min="0" style={inp} value={form.sort_order} onChange={e => s('sort_order', e.target.value)} />
              </div>
            )}
            {/* Status */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', paddingTop:'1.5rem' }}>
              <input type="checkbox" id="ia" checked={form.is_active} onChange={e => s('is_active', e.target.checked)}
                style={{ width:'1rem', height:'1rem', cursor:'pointer' }} />
              <label htmlFor="ia" style={{ cursor:'pointer', fontSize:'0.875rem', fontWeight:600, color:'#374151' }}>نشط</label>
            </div>
          </div>

          {/* Image URL + upload */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#374151', marginBottom:'0.25rem' }}>
              {uploadSubdir === 'categories' ? 'صورة القسم' : 'شعار الماركة'}
            </label>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
              {form.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.image_url} alt="preview" style={{ width:48, height:48, objectFit:'cover', borderRadius:'6px', border:'1px solid #e5e7eb' }}
                  onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
              )}
              <input type="text" style={{ ...inp, flex:1, minWidth:'180px', direction:'ltr' }}
                value={form.image_url} onChange={e => s('image_url', e.target.value)}
                placeholder="الرابط سيُملأ تلقائياً أو أدخله يدوياً" />
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFile} />
              <button type="button" style={{ ...btnUpload, opacity: uploading ? 0.6 : 1 }} disabled={uploading}
                onClick={() => fileRef.current?.click()}>
                {uploading ? '⏳ جاري الرفع…' : '📤 رفع'}
              </button>
            </div>
            {uploadErr && <p style={{ color:'#b91c1c', fontSize:'0.8rem', marginTop:'0.25rem' }}>{uploadErr}</p>}
          </div>

          <div style={{ display:'flex', gap:'0.5rem' }}>
            <button type="submit" style={btnPrimary} disabled={saving || uploading}>
              {saving ? 'جاري الحفظ…' : 'حفظ'}
            </button>
            <button type="button" style={btnSecondary} onClick={onCancel}>إلغاء</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CatalogTable({
  title, addLabel, apiBase, uploadSubdir, nameLabel, nameKey, hasSort,
}: Props) {
  const [rows, setRows]         = useState<CatalogRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [addOpen, setAddOpen]   = useState(false);
  const [editId, setEditId]     = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleteErr, setDeleteErr] = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(apiBase);
    const data = await res.json() as { categories?: CatalogRow[]; brands?: CatalogRow[] };
    const raw = data.categories ?? data.brands ?? [];
    setRows(raw.map(r => ({
      ...r,
      name: nameKey === 'name_ar' ? (r as unknown as { name_ar: string }).name_ar : r.name,
      product_count: (r as unknown as { _count?: { products: number } })._count?.products ?? 0,
    })));
    setLoading(false);
  }, [apiBase, nameKey]);

  useEffect(() => { load(); }, [load]);

  const toFormState = (row: CatalogRow): FormState => ({
    name:       row.name,
    slug:       row.slug,
    image_url:  row.image_url ?? '',
    sort_order: String(row.sort_order ?? 0),
    is_active:  row.is_active,
  });

  const buildPayload = (form: FormState) => ({
    [nameKey]:   form.name,
    slug:        form.slug,
    image_url:   form.image_url || undefined,
    sort_order:  hasSort ? parseInt(form.sort_order) || 0 : undefined,
    is_active:   form.is_active,
  });

  const handleAdd = async (form: FormState) => {
    setSaving(true);
    const res = await fetch(apiBase, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    });
    const data = await res.json() as { error?: string };
    setSaving(false);
    if (!res.ok) { showToast(data.error ?? 'فشل الحفظ', false); return; }
    showToast(`تمت إضافة ${title.slice(0, -1)} بنجاح`);
    setAddOpen(false);
    load();
  };

  const handleEdit = async (form: FormState) => {
    if (!editId) return;
    setSaving(true);
    const res = await fetch(`${apiBase}/${editId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload(form)),
    });
    const data = await res.json() as { error?: string };
    setSaving(false);
    if (!res.ok) { showToast(data.error ?? 'فشل التعديل', false); return; }
    showToast('تم التعديل بنجاح');
    setEditId(null);
    load();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`${apiBase}/${deleteId}`, { method: 'DELETE' });
    const data = await res.json() as { error?: string; ok?: boolean };
    if (!res.ok) { setDeleteErr(data.error ?? 'فشل الحذف'); return; }
    setDeleteId(null); setDeleteErr('');
    showToast('تم الحذف بنجاح');
    load();
  };

  const handleToggle = async (id: number) => {
    const res = await fetch(`${apiBase}/${id}/toggle`, { method: 'PATCH' });
    if (!res.ok) { showToast('فشل تغيير الحالة', false); return; }
    const data = await res.json() as { category?: { is_active: boolean }; brand?: { is_active: boolean } };
    const newActive = data.category?.is_active ?? data.brand?.is_active;
    setRows(prev => prev.map(r => r.id === id ? { ...r, is_active: newActive ?? r.is_active } : r));
  };

  const editRow = rows.find(r => r.id === editId);

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position:'fixed', top:'1rem', right:'1rem', zIndex:9999,
          padding:'0.75rem 1.25rem', borderRadius:'8px',
          background: toast.ok ? '#16a34a' : '#b91c1c', color:'#fff',
          fontWeight:600, boxShadow:'0 4px 12px rgba(0,0,0,0.15)',
        }}>{toast.msg}</div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.4)',
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:'8px', padding:'1.5rem 2rem', maxWidth:'420px', width:'90%' }}>
            <p style={{ fontSize:'1rem', marginBottom:'0.75rem', color:'#111827', fontWeight:600 }}>
              تأكيد الحذف
            </p>
            {deleteErr ? (
              <>
                <div style={{ background:'#fee2e2', color:'#b91c1c', padding:'0.75rem 1rem',
                  borderRadius:'6px', marginBottom:'1rem', fontSize:'0.9rem' }}>
                  {deleteErr}
                </div>
                <button style={btnSecondary} onClick={() => { setDeleteId(null); setDeleteErr(''); }}>إغلاق</button>
              </>
            ) : (
              <>
                <p style={{ color:'#6b7280', marginBottom:'1.25rem', fontSize:'0.9rem' }}>
                  هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button onClick={handleDelete} style={{ ...btnDanger, padding:'0.5rem 1.25rem', fontWeight:700 }}>حذف</button>
                  <button onClick={() => { setDeleteId(null); setDeleteErr(''); }} style={btnSecondary}>إلغاء</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.25rem' }}>
        <h1 style={{ margin:0, fontSize:'1.4rem', fontWeight:700, color:'#111827' }}>{title}</h1>
        <button style={btnPrimary} onClick={() => { setAddOpen(true); setEditId(null); }}>
          + {addLabel}
        </button>
      </div>

      {/* Table */}
      <div style={card}>
        {loading ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'#9ca3af' }}>جاري التحميل…</div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ background:'#f9fafb', borderBottom:'2px solid #e5e7eb' }}>
                  {['الصورة', nameLabel, 'Slug', hasSort ? 'الترتيب' : null,
                    'المنتجات', 'الحالة', 'الإجراءات']
                    .filter(Boolean).map(h => (
                    <th key={h!} style={{ padding:'0.75rem 1rem', textAlign:'right',
                      color:'#6b7280', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Add form row */}
                {addOpen && (
                  <RowForm initial={EMPTY} nameLabel={nameLabel}
                    hasSort={hasSort} uploadSubdir={uploadSubdir}
                    onSave={handleAdd} onCancel={() => setAddOpen(false)} saving={saving} />
                )}

                {rows.length === 0 && !addOpen && (
                  <tr><td colSpan={99} style={{ padding:'3rem', textAlign:'center', color:'#9ca3af' }}>
                    لا توجد بيانات
                  </td></tr>
                )}

                {rows.map((row, i) => (
                  <React.Fragment key={row.id}>
                    <tr
                      style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderTop:'1px solid #f3f4f6' }}>
                      {/* Image */}
                      <td style={{ padding:'0.6rem 1rem' }}>
                        {row.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={row.image_url} alt={row.name}
                            style={{ width:40, height:40, objectFit:'cover', borderRadius:'6px', border:'1px solid #e5e7eb' }}
                            onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        ) : (
                          <div style={{ width:40, height:40, background:'#f3f4f6', borderRadius:'6px',
                            display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:'1.1rem' }}>
                            {uploadSubdir === 'categories' ? '🗂️' : '🏷️'}
                          </div>
                        )}
                      </td>
                      {/* Name */}
                      <td style={{ padding:'0.6rem 1rem', fontWeight:600, color:'#111827' }}>{row.name}</td>
                      {/* Slug */}
                      <td style={{ padding:'0.6rem 1rem', color:'#6b7280', direction:'ltr', textAlign:'left' }}>
                        <code style={{ fontSize:'0.8rem' }}>{row.slug}</code>
                      </td>
                      {/* Sort order */}
                      {hasSort && <td style={{ padding:'0.6rem 1rem', color:'#374151', textAlign:'center' }}>{row.sort_order ?? 0}</td>}
                      {/* Product count */}
                      <td style={{ padding:'0.6rem 1rem', textAlign:'center' }}>
                        <span style={{ fontWeight:700, color: row.product_count > 0 ? '#2563eb' : '#9ca3af' }}>
                          {row.product_count}
                        </span>
                      </td>
                      {/* Active toggle */}
                      <td style={{ padding:'0.6rem 1rem' }}>
                        <button onClick={() => handleToggle(row.id)} style={{ ...badge(row.is_active), border:'none', cursor:'pointer' }}>
                          {row.is_active ? 'نشط' : 'مخفي'}
                        </button>
                      </td>
                      {/* Actions */}
                      <td style={{ padding:'0.6rem 1rem' }}>
                        <div style={{ display:'flex', gap:'0.35rem' }}>
                          <button style={btnEdit} onClick={() => { setEditId(row.id); setAddOpen(false); }}>تعديل</button>
                          <button style={btnDanger} onClick={() => { setDeleteId(row.id); setDeleteErr(''); }}>حذف</button>
                        </div>
                      </td>
                    </tr>

                    {/* Edit form row — inline below the row being edited */}
                    {editId === row.id && editRow && (
                      <RowForm key={`edit-${row.id}`}
                        initial={toFormState(editRow)} nameLabel={nameLabel}
                        hasSort={hasSort} uploadSubdir={uploadSubdir}
                        onSave={handleEdit} onCancel={() => setEditId(null)} saving={saving} />
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
