import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { isValidSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

// GET /api/admin/categories
export async function GET() {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const categories = await prisma.category.findMany({
    orderBy: [{ sort_order: 'asc' }, { name_ar: 'asc' }],
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

// POST /api/admin/categories
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  try {
    const body = await req.json() as {
      name_ar: string; slug: string; image_url?: string;
      sort_order?: number; is_active?: boolean;
    };

    if (!body.name_ar?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'الاسم والرابط مطلوبان' }, { status: 400 });
    }
    if (!isValidSlug(body.slug.trim())) {
      return NextResponse.json({ error: 'الرابط المختصر غير صالح — استخدم حروفاً لاتينية وأرقاماً وشرطات فقط، مثال: smartphones' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name_ar:    body.name_ar.trim(),
        slug:       body.slug.trim(),
        image_url:  body.image_url?.trim() || null,
        sort_order: body.sort_order ?? 0,
        is_active:  body.is_active ?? true,
      },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
