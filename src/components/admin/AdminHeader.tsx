'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface AdminHeaderProps {
  adminName: string;
}

export function AdminHeader({ adminName }: AdminHeaderProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <header
      style={{
        height: '56px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        مرحباً،{' '}
        <span style={{ fontWeight: 600, color: '#111827' }}>{adminName}</span>
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        style={{
          padding: '0.4rem 1rem',
          background: loading ? '#e5e7eb' : '#fff',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#374151',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#f9fafb')}
        onMouseLeave={(e) => !loading && ((e.target as HTMLButtonElement).style.background = '#fff')}
      >
        {loading ? 'جاري الخروج...' : 'تسجيل الخروج'}
      </button>
    </header>
  );
}
