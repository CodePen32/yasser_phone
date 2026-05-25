import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/products/ProductForm';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
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

  return <ProductForm mode="new" categories={categories} brands={brands} />;
}
