import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { randomUUID } from 'crypto';
import { requireAdmin } from '@/lib/auth';
import { uploadToR2 } from '@/lib/storage/r2';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_EXT   = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES     = 5 * 1024 * 1024; // 5 MB

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg':  '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
};

const ALLOWED_SUBDIRS = new Set(['products', 'categories', 'brands', 'store']);

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  try {
    const formData = await req.formData();
    const file     = formData.get('file');
    const rawSubdir = formData.get('subdir');
    const subdir = (typeof rawSubdir === 'string' && ALLOWED_SUBDIRS.has(rawSubdir))
      ? rawSubdir
      : 'products';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'لم يتم إرفاق ملف' }, { status: 400 });
    }

    // ── Validate MIME type ──────────────────────────────────────────────────
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'نوع الملف غير مسموح به. المسموح: JPG، PNG، WEBP فقط' },
        { status: 415 },
      );
    }

    // ── Validate extension ──────────────────────────────────────────────────
    const originalExt = extname(file.name).toLowerCase();
    if (originalExt && !ALLOWED_EXT.has(originalExt)) {
      return NextResponse.json(
        { error: 'امتداد الملف غير مسموح به' },
        { status: 415 },
      );
    }

    // ── Validate size ───────────────────────────────────────────────────────
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) {
      return NextResponse.json(
        { error: 'حجم الملف يتجاوز الحد الأقصى (5 ميغابايت)' },
        { status: 413 },
      );
    }

    // ── Validate magic bytes ────────────────────────────────────────────────
    const header   = new Uint8Array(bytes.slice(0, 4));
    const isJpeg   = header[0] === 0xFF && header[1] === 0xD8;
    const isPng    = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
    const isWebp   = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
    const mimeJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';

    if (mimeJpeg           && !isJpeg) return NextResponse.json({ error: 'محتوى الملف لا يطابق نوعه' }, { status: 415 });
    if (file.type === 'image/png'  && !isPng)  return NextResponse.json({ error: 'محتوى الملف لا يطابق نوعه' }, { status: 415 });
    if (file.type === 'image/webp' && !isWebp) return NextResponse.json({ error: 'محتوى الملف لا يطابق نوعه' }, { status: 415 });

    // ── Build unique filename ───────────────────────────────────────────────
    const safeExt  = MIME_TO_EXT[file.type] ?? '.jpg';
    const fileName = `${randomUUID()}${safeExt}`;
    const buffer   = Buffer.from(bytes);

    let url: string;

    if (IS_PRODUCTION) {
      // ── Production: upload to Cloudflare R2 ────────────────────────────
      url = await uploadToR2(buffer, fileName, file.type, subdir);
    } else {
      // ── Development: save to public/uploads ────────────────────────────
      const uploadDir = join(process.cwd(), 'public', 'uploads', subdir);
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, fileName), buffer);
      url = `/uploads/${subdir}/${fileName}`;
    }

    return NextResponse.json({ url }, { status: 201 });

  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'حدث خطأ أثناء رفع الملف' }, { status: 500 });
  }
}
