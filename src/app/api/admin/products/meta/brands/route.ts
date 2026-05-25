import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const brands = await prisma.brand.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
  return NextResponse.json({ brands });
}
