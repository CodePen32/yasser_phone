import { headers } from 'next/headers';
import { getCurrentAdmin } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already blocks unauthenticated access to all /admin/* except /admin/login.
  // We still call getCurrentAdmin() here to get the name for the header — but we NEVER
  // redirect from this layout (that would loop on /admin/login because layout runs for it too).
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  // /admin/login — render bare (no sidebar/header shell)
  if (pathname === '/admin/login' || pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  // All other /admin/* — render with sidebar + header
  // If somehow admin is null here (middleware misconfiguration), show children anyway;
  // middleware is the authoritative guard.
  const admin = await getCurrentAdmin();

  if (!admin) {
    // Fallback: should not reach here because middleware redirects first.
    // Return children without the sidebar so at least we don't loop.
    return <>{children}</>;
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        direction: 'rtl',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: 'var(--c-bg-page)',
      }}
    >
      <AdminSidebar />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader adminName={admin.name} />
        <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
