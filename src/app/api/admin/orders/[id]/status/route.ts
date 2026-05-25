import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = new Set(['new', 'contacted', 'completed', 'cancelled']);

type Ctx = { params: Promise<{ id: string }> };

// PATCH /api/admin/orders/[id]/status
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const { id } = await ctx.params;
  const oid = parseInt(id);
  if (isNaN(oid)) return NextResponse.json({ error: 'معرّف غير صالح' }, { status: 400 });

  const body = await req.json();
  const status = typeof body.status === 'string' ? body.status : '';

  if (!VALID_STATUSES.has(status)) {
    return NextResponse.json({ error: 'حالة غير صالحة' }, { status: 400 });
  }

  const existing = await prisma.whatsappOrder.findUnique({ where: { id: oid } });
  if (!existing) return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });

  const updated = await prisma.whatsappOrder.update({
    where: { id: oid },
    data:  { status },
  });

  return NextResponse.json({ order: updated });
}
