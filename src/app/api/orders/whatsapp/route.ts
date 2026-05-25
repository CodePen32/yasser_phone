import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_MESSAGE = 2000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const productId     = typeof body.product_id === 'number' ? body.product_id : null;
    const message       = typeof body.message    === 'string' ? body.message.slice(0, MAX_MESSAGE) : '';
    const customerName  = typeof body.customer_name  === 'string' ? body.customer_name.slice(0, 100).trim() || null : null;
    const customerPhone = typeof body.customer_phone === 'string' ? body.customer_phone.slice(0, 30).trim()  || null : null;

    // Verify product exists if provided
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
  } catch (err) {
    console.error('[orders/whatsapp]', err);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
