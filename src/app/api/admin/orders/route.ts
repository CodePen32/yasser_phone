import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/admin/orders
export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });

  const orders = await prisma.whatsappOrder.findMany({
    orderBy: { created_at: 'desc' },
    include: {
      product: {
        select: { id: true, name_ar: true, price: true, currency: true, slug: true },
      },
    },
  });

  return NextResponse.json({ orders });
}
