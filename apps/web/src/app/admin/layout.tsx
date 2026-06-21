'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import { clearTokens } from '@/lib/auth';
import { useEffect } from 'react';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: '⊞' },
  { href: '/admin/orders', label: 'Orders', icon: '◉' },
  { href: '/admin/products', label: 'Products', icon: '◫' },
  { href: '/admin/promotions', label: 'Promotions', icon: '◈' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((s: RootState) => s.auth.user);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  function handleLogout() {
    clearTokens();
    dispatch(logout());
    router.push('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="text-[15px] font-semibold tracking-[0.1em] uppercase">
            NOOREMOON
          </Link>
          <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-widest">Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {navLinks.map((link) => {
            const active = link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 px-5 py-2.5 text-[13px] transition-colors ${
                  active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-[16px]">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[11px] text-white/40 truncate mb-2">{user.email}</p>
          <button
            onClick={handleLogout}
            className="text-[11px] text-white/60 hover:text-white transition-colors uppercase tracking-widest"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
