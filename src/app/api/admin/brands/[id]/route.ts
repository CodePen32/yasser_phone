import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/brands/[id]
export async function PUT(req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const bid = parseInt(id);

  try {
    const body = await req.json() as {
      name: string; slug: string; logo_url?: string; is_active?: boolean;
    };

    if (!body.name?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'الاسم والرابط مطلوبان' }, { status: 400 });
    }

    const brand = await prisma.brand.update({
      where: { id: bid },
      data: {
        name:      body.name.trim(),
        slug:      body.slug.trim(),
        logo_url:  body.logo_url?.trim() || null,
        is_active: body.is_active ?? true,
      },
    });
    return NextResponse.json({ brand });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
      if (err.code === 'P2025') return NextResponse.json({ error: 'الماركة غير موجودة' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/admin/brands/[id]
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const bid = parseInt(id);

  // Guard: refuse if products are linked
  const productCount = await prisma.product.count({ where: { brand_id: bid } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `لا يمكن حذف هذه الماركة لأنها مرتبطة بـ ${productCount} منتج. قم بإعادة تعيين ماركة المنتجات أولاً.` },
      { status: 409 }
    );
  }

  try {
    await prisma.brand.delete({ where: { id: bid } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      return NextResponse.json({ error: 'الماركة غير موجودة' }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
