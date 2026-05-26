import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { isValidSlug } from '@/lib/slug';

export const dynamic = 'force-dynamic';

// GET /api/admin/brands
export async function GET() {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ brands });
}

// POST /api/admin/brands
export async function POST(req: NextRequest) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  try {
    const body = await req.json() as {
      name: string; slug: string; logo_url?: string; is_active?: boolean;
    };

    if (!body.name?.trim() || !body.slug?.trim()) {
      return NextResponse.json({ error: 'الاسم والرابط مطلوبان' }, { status: 400 });
    }
    if (!isValidSlug(body.slug.trim())) {
      return NextResponse.json({ error: 'الرابط المختصر غير صالح — استخدم حروفاً لاتينية وأرقاماً وشرطات فقط' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name:      body.name.trim(),
        slug:      body.slug.trim(),
        logo_url:  body.logo_url?.trim() || null,
        is_active: body.is_active ?? true,
      },
    });
    return NextResponse.json({ brand }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'الرابط المختصر مستخدم مسبقاً' }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
