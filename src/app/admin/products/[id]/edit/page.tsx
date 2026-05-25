import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm, { ProductFormData, ImageRow, SpecRow } from '@/components/admin/products/ProductForm';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const pid = parseInt(id);

  if (isNaN(pid)) notFound();

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: pid },
      include: {
        images: { orderBy: { sort_order: 'asc' } },
        specs:  true,
      },
    }),
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

  if (!product) notFound();

  const initialData: ProductFormData = {
    name_ar:          product.name_ar,
    slug:             product.slug,
    description_ar:   product.description_ar ?? '',
    price:            String(product.price),
    old_price:        product.old_price ? String(product.old_price) : '',
    discount_percent: product.discount_percent ? String(product.discount_percent) : '',
    category_id:      product.category_id ? String(product.category_id) : '',
    brand_id:         product.brand_id ? String(product.brand_id) : '',
    condition:        product.condition,
    stock_status:     product.stock_status,
    storage:          product.storage ?? '',
    ram:              product.ram ?? '',
    color:            product.color ?? '',
    warranty:         product.warranty ?? '',
    main_image_url:   product.main_image_url ?? '',
    is_featured:      product.is_featured,
    is_offer:         product.is_offer,
    is_active:        product.is_active,
  };

  const initialImages: ImageRow[] = product.images.map((img) => ({
    image_url:  img.image_url,
    sort_order: String(img.sort_order),
  }));

  const initialSpecs: SpecRow[] = product.specs.map((s) => ({
    spec_name:  s.spec_name,
    spec_value: s.spec_value,
  }));

  return (
    <ProductForm
      mode="edit"
      productId={pid}
      categories={categories}
      brands={brands}
      initialData={initialData}
      initialImages={initialImages.length > 0 ? initialImages : undefined}
      initialSpecs={initialSpecs.length > 0 ? initialSpecs : undefined}
    />
  );
}
