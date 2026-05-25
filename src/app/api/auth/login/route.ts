import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    // ── Validate input ──────────────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 },
      );
    }

    // ── Find admin ──────────────────────────────────────────────────────────
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      // Same message as wrong password — don't reveal which one is wrong
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 },
      );
    }

    // ── Verify password ─────────────────────────────────────────────────────
    const valid = await bcrypt.compare(password, admin.password_hash);

    if (!valid) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 },
      );
    }

    // ── Issue JWT + set httpOnly cookie ─────────────────────────────────────
    const token = await signToken({
      id:    admin.id,
      email: admin.email,
      name:  admin.name,
      role:  admin.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({ ok: true, name: admin.name, role: admin.role });
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم، حاول مرة أخرى' },
      { status: 500 },
    );
  }
}
