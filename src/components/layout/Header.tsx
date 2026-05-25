'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { StoreSettings } from '@/types';

interface HeaderProps {
  settings: StoreSettings;
}

const WA_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const NAV_ITEMS = [
  { href: '/products',                              label: 'الكل' },
  { href: '/products?offer=true',                   label: 'عروض اليوم' },
  { href: '/products?category=smartphones',         label: 'الجوالات' },
  { href: '/products?brand=apple',                  label: 'آيفون' },
  { href: '/products?brand=samsung',                label: 'سامسونج' },
  { href: '/products?brand=xiaomi',                 label: 'شاومي' },
  { href: '/products?brand=tecno',                  label: 'تكنو' },
  { href: '/products?brand=infinix',                label: 'إنفنكس' },
  { href: '/products?brand=huawei',                 label: 'هواوي' },
  { href: '/products?category=headphones',          label: 'سماعات' },
  { href: '/products?category=chargers-cables',     label: 'شواحن' },
  { href: '/products?category=accessories',         label: 'إكسسوارات' },
  { href: '/products?category=smartwatches',        label: 'ساعات ذكية' },
];

export function Header({ settings }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen]   = useState(false);

  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent('السلام عليكم، أود الاستفسار عن منتجاتكم')}`;

  return (
    <>
      {/* ── Row 1: main header ─────────────────────────────────────────────── */}
      <header style={{ background: '#131921' }}>
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 group border border-transparent hover:border-white/30 rounded px-1.5 py-1 transition-colors">
            <Image
              src="/assets/logo.png"
              alt={settings.store_name}
              width={44}
              height={44}
              className="rounded-xl object-contain w-10 h-10 sm:w-[52px] sm:h-[52px]"
              priority
            />
            <div className="hidden sm:block leading-tight">
              <div className="text-white font-extrabold text-lg font-display">{settings.store_name}</div>
              <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Premium Mobile Store</div>
            </div>
          </Link>

          {/* Location */}
          <div className="hidden lg:flex flex-col shrink-0 border border-transparent hover:border-white/30 rounded px-2 py-1 cursor-pointer transition-colors">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>التوصيل إلى</span>
            <span className="text-white text-xs font-bold flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {settings.city}
            </span>
          </div>

          {/* Search */}
          <form action="/products" method="get" className="flex-1">
            <div className="flex rounded-lg overflow-hidden h-10">
              <input
                type="text"
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`ابحث في ${settings.store_name}...`}
                className="flex-1 px-4 text-sm text-gray-900 placeholder-gray-500 bg-white outline-none min-w-0"
              />
              <button
                type="submit"
                className="px-4 bg-amber-400 hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0"
                aria-label="بحث"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-gray-900">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* WhatsApp */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 wa-grad text-white text-xs font-bold px-3 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              {WA_SVG}
              <span>اطلب الآن</span>
            </a>

            {/* Phone */}
            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="hidden lg:flex flex-col items-center border border-transparent hover:border-white/30 rounded px-2 py-1 transition-colors"
              >
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.6)' }}>هاتف</span>
                <span className="text-white text-xs font-bold num-latin ltr-value">{settings.phone}</span>
              </a>
            )}


            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-white border border-transparent hover:border-white/30 rounded transition-colors"
              aria-label="القائمة"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                {mobileOpen
                  ? <path d="M18 6 6 18M6 6l12 12" />
                  : <><line x1="3" x2="21" y1="6" y2="6" /><line x1="3" x2="21" y1="12" y2="12" /><line x1="3" x2="21" y1="18" y2="18" /></>
                }
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Row 2: category nav ────────────────────────────────────────────── */}
      <nav style={{ background: '#232f3e' }} className="hidden md:block">
        <div className="max-w-[1500px] mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-0 overflow-x-auto no-scrollbar h-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white text-xs font-medium px-3 py-2 rounded hover:bg-white/10 transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* ── Mobile drawer ──────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ background: '#232f3e', borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="px-4 py-3 flex flex-col gap-1">
            <a href={waUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 wa-grad text-white font-bold py-2.5 rounded-lg mb-2">
              {WA_SVG} اطلب الآن عبر واتساب
            </a>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-white text-sm px-3 py-2 rounded hover:bg-white/10 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
