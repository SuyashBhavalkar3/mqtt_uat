'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const routes = [
  { href: '/', label: 'Overview' },
  { href: '/models', label: 'Models' },
  { href: '/training', label: 'Training' },
  { href: '/optimizers', label: 'Optimizers' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/classes', label: 'Classes' },
];

export default function AnalyticsShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const path = usePathname();
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-rose-200 bg-white/80 p-6 shadow-lg">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          <nav className="mt-4 flex flex-wrap gap-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`rounded-full px-4 py-2 text-sm ${path === route.href ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
