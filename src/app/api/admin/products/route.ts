import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { isValidSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

// ─── GET /api/admin/products ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { searchParams } = req.nextUrl;
  const q          = searchParams.get('q') ?? '';
  const categoryId = searchParams.get('category_id');
  const brandId    = searchParams.get('brand_id');
  const isOffer    = searchParams.get('is_offer');
  const isFeatured = searchParams.get('is_featured');
  const isActive   = searchParams.get('is_active');
  const condition  = searchParams.get('condition');
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const perPage    = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '20')));

  const where: Prisma.ProductWhereInput = {};

  if (q) where.name_ar = { contains: q };
  if (categoryId) where.category_id = parseInt(categoryId);
  if (brandId) where.brand_id = parseInt(brandId);
  if (isOffer === 'true') where.is_offer = true;
  if (isOffer === 'false') where.is_offer = false;
  if (isFeatured === 'true') where.is_featured = true;
  if (isFeatured === 'false') where.is_featured = false;
  if (isActive === 'true') where.is_active = true;
  if (isActive === 'false') where.is_active = false;
  if (condition) where.condition = condition;

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: 'desc' },
      include: {
        category: { select: { id: true, name_ar: true } },
        brand:    { select: { id: true, name: true } },
        images:   { orderBy: { sort_order: 'asc' }, take: 1 },
      },
    }),
  ]);

  return NextResponse.json({ products, total, page, per_page: perPage });
}

// ─── POST /api/admin/products ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  try {
    const body = await req.json() as {
      name_ar: string;
      slug: string;
      description_ar?: string;
      price: number;
      old_price?: number;
      discount_percent?: number;
      category_id?: number;
      brand_id?: number;
      condition?: string;
      stock_status?: string;
      storage?: string;
      ram?: string;
      color?: string;
      warranty?: string;
      main_image_url?: string;
      is_featured?: boolean;
      is_offer?: boolean;
      is_active?: boolean;
      images?: { image_url: string; sort_order?: number }[];
      specs?: { spec_name: string; spec_value: string }[];
    };

    // Validate slug
    if (!body.slug?.trim() || !isValidSlug(body.slug.trim())) {
      return NextResponse.json({ error: 'الرابط المختصر غير صالح — استخدم حروفاً لاتينية وأرقاماً وشرطات فقط' }, { status: 400 });
    }
    // Require brand and category
    if (!body.brand_id) {
      return NextResponse.json({ error: 'يجب اختيار الماركة' }, { status: 400 });
    }
    if (!body.category_id) {
      return NextResponse.json({ error: 'يجب اختيار التصنيف' }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name_ar:          body.name_ar,
          slug:             body.slug,
          description_ar:   body.description_ar ?? null,
          price:            body.price,
          old_price:        body.old_price ?? null,
          discount_percent: body.discount_percent ?? null,
          category_id:      body.category_id ?? null,
          brand_id:         body.brand_id ?? null,
          condition:        body.condition ?? 'new',
          stock_status:     body.stock_status ?? 'in_stock',
          storage:          body.storage ?? null,
          ram:              body.ram ?? null,
          color:            body.color ?? null,
          warranty:         body.warranty ?? null,
          main_image_url:   body.main_image_url ?? null,
          is_featured:      body.is_featured ?? false,
          is_offer:         body.is_offer ?? false,
          is_active:        body.is_active ?? true,
        },
      });

      if (body.images?.length) {
        await tx.productImage.createMany({
          data: body.images.map((img, idx) => ({
            product_id: created.id,
            image_url:  img.image_url,
            sort_order: img.sort_order ?? idx,
          })),
        });
      }

      if (body.specs?.length) {
        await tx.productSpec.createMany({
          data: body.specs
            .filter((s) => s.spec_name && s.spec_value)
            .map((s) => ({
              product_id: created.id,
              spec_name:  s.spec_name,
              spec_value: s.spec_value,
            })),
        });
      }

      return created;
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
