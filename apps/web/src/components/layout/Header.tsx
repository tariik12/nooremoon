'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { NavItem } from '@/lib/api';

interface Props {
  nav: NavItem[];
  siteName: string;
  supportEmail?: string;
  announcementText?: string;
}

export default function Header({ nav, siteName, supportEmail, announcementText }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const itemCount = useSelector((s: RootState) => s.cart.itemCount);
  const isLoggedIn = useSelector((s: RootState) => !!s.auth.user);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement strip */}
      {announcementText && (
        <div className="bg-[#111] text-white text-xs text-center py-2 px-4 tracking-wide">
          {announcementText}
        </div>
      )}

      {/* Utility bar */}
      <div className="bg-[#f7f7f7] border-b border-[#e5e5e5]">
        <div className="max-w-[1440px] mx-auto px-4 h-[30px] flex items-center justify-between text-xs text-[#6b6b6b]">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 hover:text-[#111] transition-colors">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              English
            </button>
            {supportEmail && (
              <a href={`mailto:${supportEmail}`}
                className="hidden sm:flex items-center gap-1 hover:text-[#111] transition-colors">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {supportEmail}
              </a>
            )}
            <span className="hidden sm:block text-[#ddd]">|</span>
            <Link href="/contact" className="hidden sm:block hover:text-[#111] transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/stores" className="hover:text-[#111] transition-colors">Store Locations</Link>
            <Link href="/app" className="hover:text-[#111] transition-colors">Apps</Link>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="bg-white border-b border-[#e5e5e5]" onMouseLeave={() => setActiveDropdown(null)}>
        <div className="max-w-[1440px] mx-auto px-4 h-[64px] flex items-center gap-4">
          {/* Hamburger */}
          <button className="md:hidden shrink-0" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 font-bold text-sm tracking-[0.2em] uppercase text-[#111]">
            {siteName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex flex-1 overflow-x-auto scrollbar-hide">
            <ul className="flex items-center whitespace-nowrap">
              {nav.map(item => (
                <li key={item.id} className="relative">
                  <Link
                    href={item.url ?? '#'}
                    className="block px-3 py-2 text-sm text-[#111] hover:opacity-50 transition-opacity whitespace-nowrap"
                    onMouseEnter={() => setActiveDropdown(item.children?.length ? item.id : null)}
                  >
                    {item.label}
                  </Link>
                  {activeDropdown === item.id && (item.children?.length ?? 0) > 0 && (
                    <div
                      className="absolute top-full left-0 bg-white border border-[#e5e5e5] shadow-lg min-w-[180px] py-2 z-50"
                      onMouseEnter={() => setActiveDropdown(item.id)}
                    >
                      {item.children!.map(child => (
                        <Link
                          key={child.id}
                          href={child.url ?? '#'}
                          className="block px-4 py-2 text-sm text-[#111] hover:bg-[#f7f7f7] transition-colors"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-3 ml-auto md:ml-0 shrink-0">
            <button aria-label="Search" className="hover:opacity-50 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <Link href={isLoggedIn ? '/profile' : '/login'} aria-label="Account" className="hover:opacity-50 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <Link href="/shopping-bag" aria-label="Shopping bag" className="relative hover:opacity-50 transition-opacity">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#111] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white w-[280px] h-full flex flex-col shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 h-16 border-b border-[#e5e5e5] shrink-0">
              <span className="font-bold text-sm tracking-[0.2em] uppercase">{siteName}</span>
              <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <nav className="py-2">
              {nav.map(item => (
                <div key={item.id} className="border-b border-[#f0f0f0]">
                  <div className="flex items-center px-4">
                    <Link
                      href={item.url ?? '#'}
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 py-3 text-sm font-medium text-[#111]"
                    >
                      {item.label}
                    </Link>
                    {(item.children?.length ?? 0) > 0 && (
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === item.id ? null : item.id)}
                        className="p-2 text-[#6b6b6b]"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {mobileExpanded === item.id
                            ? <polyline points="18 15 12 9 6 15"/>
                            : <polyline points="6 9 12 15 18 9"/>}
                        </svg>
                      </button>
                    )}
                  </div>
                  {mobileExpanded === item.id && item.children?.map(child => (
                    <Link
                      key={child.id}
                      href={child.url ?? '#'}
                      onClick={() => setMobileOpen(false)}
                      className="block pl-8 pr-4 py-2 text-sm text-[#6b6b6b] hover:text-[#111] border-b border-[#f7f7f7]"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
