'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'حدث خطأ غير متوقع');
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError('تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مجدداً.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--c-bg-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'var(--c-primary)',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ color: 'var(--c-accent)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Yasser Phone
          </div>
          <div style={{ color: '#ccc', fontSize: '0.9rem' }}>لوحة تحكم المدير</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', direction: 'rtl' }}>
          <h2
            style={{
              margin: '0 0 1.5rem',
              fontSize: '1.1rem',
              color: '#131921',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            تسجيل الدخول
          </h2>

          {error && (
            <div
              style={{
                background: '#fff5f5',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                color: '#b91c1c',
                fontSize: '0.875rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}
            >
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@yasserphone.mr"
              style={{
                width: '100%',
                padding: '0.65rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                direction: 'ltr',
                textAlign: 'left',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.4rem' }}
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.65rem 0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.95rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                direction: 'ltr',
                textAlign: 'left',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#f59e0b')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#9ca3af' : 'var(--c-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
          </button>
        </form>

        <div
          style={{
            padding: '1rem 2rem',
            borderTop: '1px solid #f3f4f6',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#9ca3af',
          }}
        >
          هذه الصفحة مخصصة للمدير فقط
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#eaeded' }} />}>
      <LoginForm />
    </Suspense>
  );
}
