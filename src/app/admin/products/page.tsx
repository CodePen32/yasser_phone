import { prisma } from '@/lib/prisma';
import ProductsClient from '@/components/admin/products/ProductsClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name_ar: 'asc' },
      select: { id: true, name_ar: true },
    }),
    prisma.brand.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  return <ProductsClient categories={categories} brands={brands} />;
}
