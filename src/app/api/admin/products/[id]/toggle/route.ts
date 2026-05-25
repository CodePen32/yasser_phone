import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// ─── PATCH /api/admin/products/[id]/toggle ────────────────────────────────────
export async function PATCH(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const pid = parseInt(id);

  const existing = await prisma.product.findUnique({ where: { id: pid }, select: { is_active: true } });
  if (!existing) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });

  const updated = await prisma.product.update({
    where: { id: pid },
    data:  { is_active: !existing.is_active },
    select: { id: true, is_active: true },
  });

  return NextResponse.json({ product: updated });
}
