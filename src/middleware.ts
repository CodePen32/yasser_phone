import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-pathname', pathname);

  // ── Public paths (login) ──────────────────────────────────────────────────
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    const admin = await getAdminFromRequest(req);
    if (admin) {
      // Already logged in → send to dashboard
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    // Not logged in → show login page
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Protected paths ───────────────────────────────────────────────────────
  const admin = await getAdminFromRequest(req);
  if (!admin) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Match /admin exactly AND /admin/anything
  matcher: ['/admin', '/admin/:path*'],
};
