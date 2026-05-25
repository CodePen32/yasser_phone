import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/categories/[id]/toggle
export async function PATCH(_req: NextRequest, ctx: Ctx) {
  const unauth = await requireAdmin(); if (unauth) return unauth;
  const { id } = await ctx.params;
  const cid = parseInt(id);

  const existing = await prisma.category.findUnique({ where: { id: cid }, select: { is_active: true } });
  if (!existing) return NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 });

  const updated = await prisma.category.update({
    where: { id: cid },
    data:  { is_active: !existing.is_active },
    select: { id: true, is_active: true },
  });
  return NextResponse.json({ category: updated });
}
