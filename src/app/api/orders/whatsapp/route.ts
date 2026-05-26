import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_MESSAGE = 2000;
const MAX_NAME    = 100;
const MAX_PHONE   = 30;

// In-memory rate limit: max 10 requests per IP per minute (resets on cold start)
const ipWindows = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now    = Date.now();
  const window = ipWindows.get(ip);
  if (!window || now > window.resetAt) {
    ipWindows.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (window.count >= 10) return false;
  window.count++;
  return true;
}

// Strip ASCII control characters (except \t \n \r) and HTML tags
function sanitize(s: string): string {
  return s
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '0.0.0.0';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'طلبات كثيرة — انتظر دقيقة' }, { status: 429 });
  }

  try {
    const body = await req.json();

    const productId    = typeof body.product_id      === 'number' ? body.product_id : null;
    const message      = sanitize(typeof body.message      === 'string' ? body.message      : '').slice(0, MAX_MESSAGE);
    const customerName = sanitize(typeof body.customer_name  === 'string' ? body.customer_name  : '').slice(0, MAX_NAME)  || null;
    const customerPhone= sanitize(typeof body.customer_phone === 'string' ? body.customer_phone : '').slice(0, MAX_PHONE) || null;

    if (productId !== null) {
      const exists = await prisma.product.findUnique({
        where:  { id: productId },
        select: { id: true },
      });
      if (!exists) {
        return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });
      }
    }

    const order = await prisma.whatsappOrder.create({
      data: {
        product_id:     productId,
        message,
        customer_name:  customerName,
        customer_phone: customerPhone,
        status:         'new',
      },
    });

    return NextResponse.json({ ok: true, id: order.id }, { status: 201 });
  } catch {
    // Don't log body content — may contain PII
    console.error('[orders/whatsapp] unexpected error');
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
