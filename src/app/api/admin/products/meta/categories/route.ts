import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name_ar: 'asc' },
    select: { id: true, name_ar: true },
  });
  return NextResponse.json({ categories });
}
