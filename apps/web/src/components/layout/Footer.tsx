import Link from 'next/link';
import type { NavItem } from '@/lib/api';
import NewsletterForm from './NewsletterForm';

interface Props {
  nav: NavItem[];
  siteName: string;
  instagram?: string;
  facebook?: string;
  supportEmail?: string;
}

const HELP_LINKS = [
  ['Track Order', '/orders/track'],
  ['Size Guide', '/size-guide'],
  ['Shipping & Returns', '/shipping'],
  ['Exchange Policy', '/exchange'],
  ['FAQs', '/faqs'],
  ['Contact Us', '/contact'],
];

const ABOUT_LINKS = [
  ['Our Story', '/about'],
  ['Sustainability', '/sustainability'],
  ['Press', '/press'],
  ['Careers', '/careers'],
];

export default function Footer({ nav, siteName, instagram, facebook, supportEmail }: Props) {
  const navWithChildren = nav.filter(n => (n.children?.length ?? 0) > 0);
  const navWithoutChildren = nav.filter(n => !n.children?.length);

  return (
    <footer className="bg-[#0a0a0a] text-[#888]">
      {/* Mega link grid */}
      <div className="max-w-[1440px] mx-auto px-6 pt-14 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Nav columns with children */}
          {navWithChildren.map(item => (
            <div key={item.id}>
              <h4 className="text-[#fff] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">
                {item.label}
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link href={item.url ?? '#'}
                    className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                    All {item.label}
                  </Link>
                </li>
                {item.children!.map(child => (
                  <li key={child.id}>
                    <Link href={child.url ?? '#'}
                      className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Flat nav items */}
          {navWithoutChildren.length > 0 && (
            <div>
              <h4 className="text-[#fff] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">
                Explore
              </h4>
              <ul className="space-y-2">
                {navWithoutChildren.map(item => (
                  <li key={item.id}>
                    <Link href={item.url ?? '#'}
                      className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Help */}
          <div>
            <h4 className="text-[#fff] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">Help</h4>
            <ul className="space-y-2">
              {HELP_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-[#fff] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">About</h4>
            <ul className="space-y-2">
              {ABOUT_LINKS.map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              {supportEmail && (
                <li>
                  <a href={`mailto:${supportEmail}`}
                    className="text-xs text-[#888] hover:text-[#ccc] transition-colors">
                    {supportEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[#fff] text-[10px] font-semibold uppercase tracking-[0.15em] mb-4">
              Stay Updated
            </h4>
            <p className="text-xs text-[#666] mb-3 leading-relaxed">
              New arrivals, exclusive offers, style notes.
            </p>
            <NewsletterForm dark />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-[1440px] mx-auto px-6 py-8 text-center">
          <p className="text-lg font-bold tracking-[0.3em] text-white uppercase mb-4">{siteName}</p>
          <div className="flex justify-center gap-6 mb-4">
            {instagram && (
              <a href={instagram} target="_blank" rel="noreferrer"
                className="text-xs text-[#555] hover:text-[#888] transition-colors">
                Instagram
              </a>
            )}
            {facebook && (
              <a href={facebook} target="_blank" rel="noreferrer"
                className="text-xs text-[#555] hover:text-[#888] transition-colors">
                Facebook
              </a>
            )}
          </div>
          <div className="flex justify-center gap-6 mb-4 text-[11px] text-[#444]">
            <Link href="/privacy" className="hover:text-[#666] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#666] transition-colors">Terms of Use</Link>
          </div>
          <p className="text-[11px] text-[#444]">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
