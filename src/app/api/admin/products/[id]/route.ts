import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { isValidSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// ─── GET /api/admin/products/[id] ────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) },
    include: {
      category: { select: { id: true, name_ar: true } },
      brand:    { select: { id: true, name: true } },
      images:   { orderBy: { sort_order: 'asc' } },
      specs:    true,
    },
  });

  if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
  return NextResponse.json({ product });
}

// ─── PUT /api/admin/products/[id] ────────────────────────────────────────────
export async function PUT(req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const pid = parseInt(id);

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

    if (!body.slug?.trim() || !isValidSlug(body.slug.trim())) {
      return NextResponse.json({ error: 'الرابط المختصر غير صالح — استخدم حروفاً لاتينية وأرقاماً وشرطات فقط' }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: pid },
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

      // Replace images
      await tx.productImage.deleteMany({ where: { product_id: pid } });
      if (body.images?.length) {
        await tx.productImage.createMany({
          data: body.images.map((img, idx) => ({
            product_id: pid,
            image_url:  img.image_url,
            sort_order: img.sort_order ?? idx,
          })),
        });
      }

      // Replace specs
      await tx.productSpec.deleteMany({ where: { product_id: pid } });
      if (body.specs?.length) {
        await tx.productSpec.createMany({
          data: body.specs
            .filter((s) => s.spec_name && s.spec_value)
            .map((s) => ({
              product_id: pid,
              spec_name:  s.spec_name,
              spec_value: s.spec_value,
            })),
        });
      }

      return updated;
    });

    return NextResponse.json({ product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
      }
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
      }
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// ─── DELETE /api/admin/products/[id] ─────────────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
