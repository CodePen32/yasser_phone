import CatalogTable from '@/components/admin/shared/CatalogTable';

export const dynamic = 'force-dynamic';

export default function AdminBrandsPage() {
  return (
    <CatalogTable
      title="إدارة الماركات"
      addLabel="إضافة ماركة"
      apiBase="/api/admin/brands"
      uploadSubdir="brands"
      nameLabel="اسم الماركة"
      nameKey="name"
      hasSort={false}
      fields={[]}
    />
  );
}
