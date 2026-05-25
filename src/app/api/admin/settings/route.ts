import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET /api/admin/settings
export async function GET() {
  const settings = await prisma.storeSettings.findFirst({ orderBy: { id: 'asc' } });
  if (!settings) {
    return NextResponse.json({
      id: null, store_name: 'Yasser Phone', slogan: null,
      logo_url: null, favicon_url: null, whatsapp_number: '22232816779',
      phone: null, email: null, address: null, city: 'نواكشوط',
      currency: 'MRU', facebook_url: null, instagram_url: null, tiktok_url: null,
    });
  }
  return NextResponse.json(settings);
}

// PUT /api/admin/settings
export async function PUT(req: NextRequest) {
  // Auth check
  const jar = await cookies();
  const token = jar.get('yp_admin_token')?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const body = await req.json();

  const data = {
    store_name:      typeof body.store_name      === 'string' ? body.store_name.trim()      : undefined,
    slogan:          typeof body.slogan          === 'string' ? body.slogan.trim() || null   : undefined,
    logo_url:        typeof body.logo_url        === 'string' ? body.logo_url.trim() || null : undefined,
    favicon_url:     typeof body.favicon_url     === 'string' ? body.favicon_url.trim() || null : undefined,
    whatsapp_number: typeof body.whatsapp_number === 'string' ? body.whatsapp_number.trim()  : undefined,
    phone:           typeof body.phone           === 'string' ? body.phone.trim() || null    : undefined,
    email:           typeof body.email           === 'string' ? body.email.trim() || null    : undefined,
    address:         typeof body.address         === 'string' ? body.address.trim() || null  : undefined,
    city:            typeof body.city            === 'string' ? body.city.trim() || null     : undefined,
    currency:        typeof body.currency        === 'string' ? body.currency.trim() || null : undefined,
    facebook_url:    typeof body.facebook_url    === 'string' ? body.facebook_url.trim() || null  : undefined,
    instagram_url:   typeof body.instagram_url   === 'string' ? body.instagram_url.trim() || null : undefined,
    tiktok_url:      typeof body.tiktok_url      === 'string' ? body.tiktok_url.trim() || null    : undefined,
  };

  // Remove undefined keys
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));

  const existing = await prisma.storeSettings.findFirst({ orderBy: { id: 'asc' } });

  const saved = existing
    ? await prisma.storeSettings.update({ where: { id: existing.id }, data: clean })
    : await prisma.storeSettings.create({ data: { store_name: 'Yasser Phone', whatsapp_number: '22232816779', ...clean } });

  return NextResponse.json({ settings: saved });
}
