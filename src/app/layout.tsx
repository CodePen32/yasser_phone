import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yasser Phone — متجر الهواتف والإكسسوارات',
  description: 'أحدث الهواتف الذكية والإكسسوارات الأصلية بأفضل الأسعار في نواكشوط',
  icons: { icon: '/assets/favicon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen" style={{ background: 'var(--c-bg-page)' }}>
        {children}
      </body>
    </html>
  );
}
