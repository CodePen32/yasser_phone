'use client';

interface Props {
  productId:      number;
  waUrl:          string;
  message:        string;
  className?:     string;
  children:       React.ReactNode;
}

async function logOrder(productId: number, message: string) {
  try {
    await fetch('/api/orders/whatsapp', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ product_id: productId, message }),
    });
  } catch (err) {
    console.error('[logOrder]', err);
  }
}

export function WhatsAppOrderButton({ productId, waUrl, message, className, children }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    logOrder(productId, message).catch(() => {});
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <a href={waUrl} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
