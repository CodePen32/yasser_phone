import CatalogTable from '@/components/admin/shared/CatalogTable';

export const dynamic = 'force-dynamic';

export default function AdminCategoriesPage() {
  return (
    <CatalogTable
      title="إدارة الأقسام"
      addLabel="إضافة قسم"
      apiBase="/api/admin/categories"
      uploadSubdir="categories"
      nameLabel="الاسم العربي"
      nameKey="name_ar"
      hasSort={true}
      fields={[]}
    />
  );
}
