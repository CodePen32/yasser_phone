// Authentication helpers — JWT + bcrypt
// All sensitive operations happen server-side only.

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// ─── Constants ────────────────────────────────────────────────────────────────

const COOKIE_NAME = 'yp_admin_token';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in environment variables');
  return new TextEncoder().encode(secret);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export interface AdminPayload {
  id:    number;
  email: string;
  name:  string;
  role:  string;
}

export async function signToken(payload: AdminPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

// ─── Cookie helpers (Server Components / Route Handlers) ─────────────────────

export async function setAuthCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'lax',
    maxAge:    COOKIE_MAX_AGE,
    path:      '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getAuthCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(COOKIE_NAME)?.value;
}

// ─── Get current admin from cookie (Server Components) ───────────────────────

export async function getCurrentAdmin(): Promise<AdminPayload | null> {
  const token = await getAuthCookie();
  if (!token) return null;
  return verifyToken(token);
}

// ─── Get current admin from Request (Middleware) ──────────────────────────────

export async function getAdminFromRequest(req: NextRequest): Promise<AdminPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// ─── Route-handler guard — returns 401 response or null ──────────────────────
// Usage: const unauth = await requireAdmin(); if (unauth) return unauth;

export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  return null;
}
