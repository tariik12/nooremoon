import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { fetchNav, fetchSettings } from '@/lib/api';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [nav, settings] = await Promise.all([fetchNav(), fetchSettings()]);

  const announcementActive = settings['announcement_bar_active'] === 'true';
  const announcementText = settings['announcement_bar_text'] ?? '';

  return (
    <>
      <Header
        nav={nav}
        siteName={settings['site_name'] ?? 'NOOREMOON'}
        supportEmail={settings['support_email']}
        announcementText={announcementActive ? announcementText : undefined}
      />
      <main className="flex-1">{children}</main>
      <Footer
        nav={nav}
        siteName={settings['site_name'] ?? 'NOOREMOON'}
        instagram={settings['instagram_url']}
        facebook={settings['facebook_url']}
        supportEmail={settings['support_email']}
      />
    </>
  );
}
