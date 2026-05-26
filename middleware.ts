import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

// Protect all /admin pages and /api/admin/* routes at the edge
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to admin paths
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Allow the login page itself through
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  const admin = await getAdminFromRequest(req);

  if (!admin) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }
    // Page routes → redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
