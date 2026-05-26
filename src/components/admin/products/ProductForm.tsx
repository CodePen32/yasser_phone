'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProductFormData {
  name_ar: string;
  slug: string;
  description_ar: string;
  price: string;
  old_price: string;
  discount_percent: string;
  category_id: string;
  brand_id: string;
  condition: string;
  stock_status: string;
  storage: string;
  ram: string;
  color: string;
  warranty: string;
  main_image_url: string;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
}

export interface ImageRow { image_url: string; sort_order: string }
export interface SpecRow  { spec_name: string; spec_value: string }

interface CategoryOption { id: number; name_ar: string }
interface BrandOption    { id: number; name: string }

interface Props {
  initialData?: Partial<ProductFormData>;
  initialImages?: ImageRow[];
  initialSpecs?: SpecRow[];
  categories: CategoryOption[];
  brands: BrandOption[];
  mode: 'new' | 'edit';
  productId?: number;
}

// ─── Slug helper ──────────────────────────────────────────────────────────────
function toSlug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') // ASCII only — no Arabic chars in slug
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Upload helper ────────────────────────────────────────────────────────────
async function uploadFile(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json() as { url?: string; error?: string };
  if (!res.ok) return { error: data.error ?? 'فشل الرفع' };
  return { url: data.url };
}

// ─── Style helpers ────────────────────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.35rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.875rem',
  color: '#111827',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
};

const sectionTitle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#111827',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '2px solid #f3f4f6',
};

const card: React.CSSProperties = {
  background: '#fff',
  borderRadius: '8px',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  padding: '1.5rem',
  marginBottom: '1.25rem',
};

const grid2: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '1rem',
};

const btnPrimary: React.CSSProperties = {
  padding: '0.6rem 1.5rem',
  background: '#131921',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  padding: '0.6rem 1.25rem',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.9rem',
};

const btnSmall: React.CSSProperties = {
  padding: '0.3rem 0.65rem',
  background: '#f3f4f6',
  color: '#374151',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
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

const btnUpload: React.CSSProperties = {
  padding: '0.5rem 0.875rem',
  background: '#eff6ff',
  color: '#2563eb',
  border: '1px dashed #93c5fd',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

// ─── Tiny image preview ───────────────────────────────────────────────────────
function ImgPreview({ src }: { src: string }) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="preview"
      style={{
        width: 56, height: 56, objectFit: 'cover',
        borderRadius: '6px', border: '1px solid #e5e7eb', flexShrink: 0,
      }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

// ─── Default empty rows ───────────────────────────────────────────────────────
const DEFAULT_SPECS: SpecRow[] = [
  { spec_name: 'التخزين',  spec_value: '' },
  { spec_name: 'RAM',       spec_value: '' },
  { spec_name: 'اللون',    spec_value: '' },
  { spec_name: 'الضمان',   spec_value: '' },
];

const EMPTY_FORM: ProductFormData = {
  name_ar: '', slug: '', description_ar: '',
  price: '', old_price: '', discount_percent: '',
  category_id: '', brand_id: '',
  condition: 'new', stock_status: 'in_stock',
  storage: '', ram: '', color: '', warranty: '',
  main_image_url: '',
  is_featured: false, is_offer: false, is_active: true,
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductForm({
  initialData,
  initialImages,
  initialSpecs,
  categories,
  brands,
  mode,
  productId,
}: Props) {
  const router = useRouter();
  const [form, setForm]         = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData });
  const [images, setImages]     = useState<ImageRow[]>(initialImages ?? [{ image_url: '', sort_order: '0' }]);
  const [specs, setSpecs]       = useState<SpecRow[]>(initialSpecs ?? DEFAULT_SPECS);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [slugManual, setSlugManual] = useState(!!initialData?.slug);

  // Upload state: null = idle, 'main' = uploading main, number = uploading gallery index
  const [uploading, setUploading] = useState<'main' | number | null>(null);
  const mainFileRef   = useRef<HTMLInputElement>(null);
  const galleryRefs   = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-generate slug from name_ar
  useEffect(() => {
    if (!slugManual && form.name_ar) {
      setForm((f) => ({ ...f, slug: toSlug(form.name_ar) }));
    }
  }, [form.name_ar, slugManual]);

  const set = (field: keyof ProductFormData, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── Main image upload ────────────────────────────────────────────────────
  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('main');
    setError('');
    const result = await uploadFile(file);
    setUploading(null);
    if (result.error) { setError(result.error); return; }
    set('main_image_url', result.url!);
    // Reset input so same file can be re-selected
    if (mainFileRef.current) mainFileRef.current.value = '';
  };

  // ── Gallery image upload ─────────────────────────────────────────────────
  const handleGalleryFileChange = async (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(idx);
    setError('');
    const result = await uploadFile(file);
    setUploading(null);
    if (result.error) { setError(result.error); return; }
    setImages((prev) => prev.map((img, i) => i === idx ? { ...img, image_url: result.url! } : img));
    const ref = galleryRefs.current[idx];
    if (ref) ref.value = '';
  };

  // Images handlers
  const addImage = () => {
    setImages((prev) => [...prev, { image_url: '', sort_order: String(prev.length) }]);
  };
  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));
  const setImage = (i: number, field: keyof ImageRow, value: string) =>
    setImages((prev) => prev.map((img, idx) => idx === i ? { ...img, [field]: value } : img));

  // Specs handlers
  const addSpec = () => setSpecs((prev) => [...prev, { spec_name: '', spec_value: '' }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  const setSpec = (i: number, field: keyof SpecRow, value: string) =>
    setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      name_ar:          form.name_ar.trim(),
      slug:             form.slug.trim(),
      description_ar:   form.description_ar.trim() || undefined,
      price:            parseFloat(form.price),
      old_price:        form.old_price ? parseFloat(form.old_price) : undefined,
      discount_percent: form.discount_percent ? parseInt(form.discount_percent) : undefined,
      category_id:      form.category_id ? parseInt(form.category_id) : undefined,
      brand_id:         form.brand_id ? parseInt(form.brand_id) : undefined,
      condition:        form.condition,
      stock_status:     form.stock_status,
      storage:          form.storage.trim() || undefined,
      ram:              form.ram.trim() || undefined,
      color:            form.color.trim() || undefined,
      warranty:         form.warranty.trim() || undefined,
      main_image_url:   form.main_image_url.trim() || undefined,
      is_featured:      form.is_featured,
      is_offer:         form.is_offer,
      is_active:        form.is_active,
      images: images.filter((img) => img.image_url.trim()).map((img, idx) => ({
        image_url:  img.image_url.trim(),
        sort_order: parseInt(img.sort_order) || idx,
      })),
      specs: specs.filter((s) => s.spec_name.trim() && s.spec_value.trim()).map((s) => ({
        spec_name:  s.spec_name.trim(),
        spec_value: s.spec_value.trim(),
      })),
    };

    try {
      const url    = mode === 'new' ? '/api/admin/products' : `/api/admin/products/${productId}`;
      const method = mode === 'new' ? 'POST' : 'PUT';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'حدث خطأ غير متوقع');
        setSaving(false);
        return;
      }
      router.push('/admin/products');
      router.refresh();
    } catch {
      setError('تعذر الاتصال بالخادم');
      setSaving(false);
    }
  };

  const field = (label: string, content: React.ReactNode) => (
    <div>
      <label style={labelStyle}>{label}</label>
      {content}
    </div>
  );

  const isUploading = uploading !== null;

  return (
    <form onSubmit={handleSubmit} style={{ direction: 'rtl', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: '#111827' }}>
          {mode === 'new' ? 'إضافة منتج جديد' : 'تعديل المنتج'}
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="button" style={btnSecondary} onClick={() => router.push('/admin/products')}>إلغاء</button>
          <button type="submit" style={btnPrimary} disabled={saving || isUploading}>
            {saving ? 'جاري الحفظ…' : mode === 'new' ? 'إضافة المنتج' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Basic info */}
      <div style={card}>
        <div style={sectionTitle}>المعلومات الأساسية</div>
        <div style={{ ...grid2, marginBottom: '1rem' }}>
          {field('اسم المنتج (عربي) *',
            <input required style={inputStyle} value={form.name_ar} onChange={(e) => set('name_ar', e.target.value)} placeholder="مثال: سامسونج غالاكسي S24" />
          )}
          {field('الرابط المختصر (slug) *',
            <input
              required style={inputStyle} value={form.slug}
              onChange={(e) => { setSlugManual(true); set('slug', e.target.value); }}
              placeholder="samsung-galaxy-s24"
              dir="ltr"
            />
          )}
        </div>
        {field('الوصف (عربي)',
          <textarea
            style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            value={form.description_ar}
            onChange={(e) => set('description_ar', e.target.value)}
            placeholder="وصف تفصيلي للمنتج…"
          />
        )}
      </div>

      {/* Pricing */}
      <div style={card}>
        <div style={sectionTitle}>التسعير</div>
        <div style={grid2}>
          {field('السعر (MRU) *',
            <input required type="number" min="0" step="0.01" style={inputStyle} value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.00" />
          )}
          {field('السعر القديم (MRU)',
            <input type="number" min="0" step="0.01" style={inputStyle} value={form.old_price} onChange={(e) => set('old_price', e.target.value)} placeholder="اختياري" />
          )}
          {field('نسبة الخصم (%)',
            <input type="number" min="0" max="100" style={inputStyle} value={form.discount_percent} onChange={(e) => set('discount_percent', e.target.value)} placeholder="اختياري" />
          )}
        </div>
      </div>

      {/* Classification */}
      <div style={card}>
        <div style={sectionTitle}>التصنيف والماركة</div>
        <div style={grid2}>
          {field('التصنيف',
            <select style={inputStyle} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}>
              <option value="">— اختر تصنيفاً —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          )}
          {field('الماركة',
            <select style={inputStyle} value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}>
              <option value="">— اختر ماركة —</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          {field('حالة المنتج',
            <select style={inputStyle} value={form.condition} onChange={(e) => set('condition', e.target.value)}>
              <option value="new">جديد</option>
              <option value="used">مستعمل</option>
              <option value="refurbished">مجدد</option>
            </select>
          )}
          {field('حالة المخزون',
            <select style={inputStyle} value={form.stock_status} onChange={(e) => set('stock_status', e.target.value)}>
              <option value="in_stock">متوفر</option>
              <option value="out_of_stock">نفذ من المخزون</option>
              <option value="limited">كمية محدودة</option>
            </select>
          )}
        </div>
      </div>

      {/* Quick specs */}
      <div style={card}>
        <div style={sectionTitle}>المواصفات السريعة</div>
        <div style={grid2}>
          {field('التخزين',
            <input style={inputStyle} value={form.storage} onChange={(e) => set('storage', e.target.value)} placeholder="مثال: 256GB" />
          )}
          {field('الذاكرة RAM',
            <input style={inputStyle} value={form.ram} onChange={(e) => set('ram', e.target.value)} placeholder="مثال: 8GB" />
          )}
          {field('اللون',
            <input style={inputStyle} value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="مثال: أسود" />
          )}
          {field('الضمان',
            <input style={inputStyle} value={form.warranty} onChange={(e) => set('warranty', e.target.value)} placeholder="مثال: سنة واحدة" />
          )}
        </div>
      </div>

      {/* Flags */}
      <div style={card}>
        <div style={sectionTitle}>الإعدادات</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {([
            ['is_featured', 'منتج مميز'],
            ['is_offer',    'عرض خاص'],
            ['is_active',   'نشط (ظاهر للعملاء)'],
          ] as [keyof ProductFormData, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* ── Main image ─────────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={sectionTitle}>الصورة الرئيسية</div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Preview */}
          {form.main_image_url && <ImgPreview src={form.main_image_url} />}

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* URL field */}
            <input
              type="text"
              style={{ ...inputStyle, marginBottom: '0.5rem' }}
              value={form.main_image_url}
              onChange={(e) => set('main_image_url', e.target.value)}
              placeholder="الرابط سيُملأ تلقائياً بعد الرفع — أو أدخله يدوياً"
              dir="ltr"
            />

            {/* Hidden file input */}
            <input
              ref={mainFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleMainFileChange}
            />

            {/* Upload button */}
            <button
              type="button"
              style={{ ...btnUpload, opacity: uploading === 'main' ? 0.6 : 1 }}
              disabled={uploading === 'main'}
              onClick={() => mainFileRef.current?.click()}
            >
              {uploading === 'main' ? '⏳ جاري الرفع…' : '📤 رفع صورة من الجهاز'}
            </button>
            <span style={{ marginRight: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
              JPG · PNG · WEBP — حتى 5 ميغابايت
            </span>
          </div>
        </div>
      </div>

      {/* ── Gallery images ────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={{ ...sectionTitle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>معرض الصور الإضافية</span>
          <button type="button" style={btnSmall} onClick={addImage}>+ إضافة صورة</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {images.map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Preview */}
              <ImgPreview src={img.image_url} />

              {/* URL field */}
              <div style={{ flex: 3, minWidth: '160px' }}>
                <input
                  type="text"
                  style={inputStyle}
                  value={img.image_url}
                  onChange={(e) => setImage(i, 'image_url', e.target.value)}
                  placeholder="الرابط سيُملأ تلقائياً بعد الرفع"
                  dir="ltr"
                />
              </div>

              {/* Sort order */}
              <div style={{ width: '64px' }}>
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={img.sort_order}
                  onChange={(e) => setImage(i, 'sort_order', e.target.value)}
                  placeholder="ترتيب"
                />
              </div>

              {/* Hidden file input per row */}
              <input
                ref={(el) => { galleryRefs.current[i] = el; }}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={(e) => handleGalleryFileChange(i, e)}
              />

              {/* Upload button */}
              <button
                type="button"
                style={{ ...btnUpload, opacity: uploading === i ? 0.6 : 1 }}
                disabled={uploading === i}
                onClick={() => galleryRefs.current[i]?.click()}
              >
                {uploading === i ? '⏳…' : '📤 رفع'}
              </button>

              {/* Delete row */}
              <button type="button" style={btnDanger} onClick={() => removeImage(i)}>حذف</button>
            </div>
          ))}

          {images.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>لم تتم إضافة صور بعد</p>
          )}
        </div>
      </div>

      {/* Specs */}
      <div style={card}>
        <div style={{ ...sectionTitle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>المواصفات التفصيلية</span>
          <button type="button" style={btnSmall} onClick={addSpec}>+ إضافة مواصفة</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {specs.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input
                  style={inputStyle}
                  value={s.spec_name}
                  onChange={(e) => setSpec(i, 'spec_name', e.target.value)}
                  placeholder="اسم المواصفة (مثال: المعالج)"
                />
              </div>
              <div style={{ flex: 2 }}>
                <input
                  style={inputStyle}
                  value={s.spec_value}
                  onChange={(e) => setSpec(i, 'spec_value', e.target.value)}
                  placeholder="القيمة (مثال: Snapdragon 8 Gen 3)"
                />
              </div>
              <button type="button" style={btnDanger} onClick={() => removeSpec(i)}>حذف</button>
            </div>
          ))}
          {specs.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>لم تتم إضافة مواصفات بعد</p>
          )}
        </div>
      </div>

      {/* Submit footer */}
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-start', marginBottom: '2rem' }}>
        <button type="submit" style={btnPrimary} disabled={saving || isUploading}>
          {saving ? 'جاري الحفظ…' : mode === 'new' ? 'إضافة المنتج' : 'حفظ التعديلات'}
        </button>
        <button type="button" style={btnSecondary} onClick={() => router.push('/admin/products')}>إلغاء</button>
      </div>
    </form>
  );
}
