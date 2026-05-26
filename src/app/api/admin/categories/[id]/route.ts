import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { isValidSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/categories/[id]
export async function PUT(req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const cid = parseInt(id);

  try {
    const body = await req.json() as {
      name_ar: string; slug: string; image_url?: string;
      sort_order?: number; is_active?: boolean;
    };

    if (!body.name_ar?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'الاسم والرابط مطلوبان' }, { status: 400 });
    }
    if (!isValidSlug(body.slug.trim())) {
      return NextResponse.json({ error: 'الرابط المختصر غير صالح — استخدم حروفاً لاتينية وأرقاماً وشرطات فقط' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: cid },
      data: {
        name_ar:    body.name_ar.trim(),
        slug:       body.slug.trim(),
        image_url:  body.image_url?.trim() || null,
        sort_order: body.sort_order ?? 0,
        is_active:  body.is_active ?? true,
      },
    });
    return NextResponse.json({ category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
      if (err.code === 'P2025') return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const cid = parseInt(id);

  // Guard: refuse if products are linked
  const productCount = await prisma.product.count({ where: { category_id: cid } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف هذا القسم لأنه مرتبط بـ ${productCount} منتج. قم بإعادة تصنيف المنتجات أولاً.` },
      { status: 409 }
    );
  }

  try {
    await prisma.category.delete({ where: { id: cid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
