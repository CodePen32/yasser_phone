import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/brands/[id]/toggle
export async function PATCH(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const bid = parseInt(id);

  const existing = await prisma.brand.findUnique({ where: { id: bid }, select: { is_active: true } });
  if (!existing) return NextResponse.json({ error: 'الماركة غير موجودة' }, { status: 404 });

  const updated = await prisma.brand.update({
    where: { id: bid },
    data:  { is_active: !existing.is_active },
    select: { id: true, is_active: true },
  });
  return NextResponse.json({ brand: updated });
}
