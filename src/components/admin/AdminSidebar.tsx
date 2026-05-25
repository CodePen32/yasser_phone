'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin',           label: 'الرئيسية',    icon: '🏠' },
  { href: '/admin/products',  label: 'المنتجات',    icon: '📦' },
  { href: '/admin/categories',label: 'التصنيفات',   icon: '🗂️' },
  { href: '/admin/brands',    label: 'الماركات',    icon: '🏷️' },
  { href: '/admin/orders',    label: 'الطلبات',      icon: '📋' },
  { href: '/admin/settings',  label: 'الإعدادات',   icon: '⚙️' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'var(--c-primary)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: '1.5rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--c-accent)', fontSize: '1.25rem', fontWeight: 700 }}>
          Yasser Phone
        </div>
        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          لوحة التحكم
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                color: isActive ? 'var(--c-accent)' : '#d1d5db',
                background: isActive ? 'rgba(245,158,11,0.1)' : 'transparent',
                borderRight: isActive ? '3px solid var(--c-accent)' : '3px solid transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
