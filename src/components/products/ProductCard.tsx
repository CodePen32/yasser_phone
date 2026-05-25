'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product:        Product;
  whatsappNumber: string;
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

export function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const productUrl  = `${appUrl}/products/${product.slug}`;
  const imageUrl    = product.main_image_url
    ? (product.main_image_url.startsWith('http') ? product.main_image_url : `${appUrl}${product.main_image_url}`)
    : null;
  const waMessage = [
    `السلام عليكم، أنا مهتم بهذا المنتج:`,
    ``,
    `المنتج: ${product.name_ar}`,
    `السعر: ${product.price.toLocaleString()} ${product.currency}`,
    imageUrl    ? `الصورة: ${imageUrl}`    : '',
    `رابط المنتج: ${productUrl}`,
    ``,
    `هل ما زال متوفراً؟`,
  ].filter((l) => l !== null).join('\n');
  const waUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waMessage)}`;

  const handleOrder = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Log the order without blocking — open WhatsApp regardless
    logOrder(product.id, waMessage).catch(() => {});
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="card-sheen group bg-[var(--c-surface)] rounded-xl border border-[var(--c-border)] hover:border-[var(--c-accent)] hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--c-surface-2)]">
        {product.main_image_url ? (
          <Image
            src={product.main_image_url}
            alt={product.name_ar}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">📱</div>
        )}

        {/* Badges */}
        <div className="absolute top-2 end-2 flex flex-col gap-1">
          {product.is_offer && product.discount_percent && (
            <span className="bg-[var(--c-price-deal)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{product.discount_percent}%
            </span>
          )}
          {product.condition === 'used' && <Badge variant="used" />}
          {product.condition === 'refurbished' && <Badge variant="refurbished" />}
        </div>

        {product.stock_status === 'out_of_stock' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-xs font-bold px-3 py-1 rounded-full">غير متوفر</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Brand */}
        {product.brand && (
          <span className="text-[11px] text-[var(--c-muted)] font-medium uppercase tracking-wide num-latin">
            {product.brand.name}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-semibold text-[var(--c-text)] line-clamp-2 leading-snug hover:text-[var(--c-link)] transition-colors">
            {product.name_ar}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <StarRating rating={product.rating} count={product.review_count} />
        )}

        {/* Bought recently */}
        {product.bought_recently > 0 && (
          <p className="text-[11px] text-[var(--c-muted)]">
            تم شراء <span className="font-semibold num-latin text-[var(--c-text)]">{product.bought_recently}+</span> في الشهر الماضي
          </p>
        )}

        {/* Price */}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-[var(--c-price)] num-latin ltr-value">
              {product.price.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[var(--c-muted)]">{product.currency}</span>
            {product.old_price && (
              <span className="text-xs text-[var(--c-muted)] line-through num-latin ltr-value">
                {product.old_price.toLocaleString()}
              </span>
            )}
          </div>

          {product.storage && (
            <p className="text-[11px] text-[var(--c-muted)] mt-0.5 num-latin">
              {product.storage}{product.ram ? ` / ${product.ram}` : ''}
            </p>
          )}
        </div>

        {/* CTA */}
        <a
          href={waUrl}
          onClick={handleOrder}
          className="mt-2 w-full flex items-center justify-center gap-2 wa-grad text-white text-sm font-semibold py-2 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          اطلب عبر واتساب
        </a>
      </div>
    </div>
  );
}
