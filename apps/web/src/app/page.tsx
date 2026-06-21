import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/ui/ProductCard';
import {
  fetchBanners, fetchCategories, fetchSubCategories,
  fetchProducts, fetchNav, fetchSettings,
  type SubCategory,
} from '@/lib/api';

export const revalidate = 60;

export default async function HomePage() {
  const [banners, categories, subCategories, newArrivals, nav, settings] = await Promise.all([
    fetchBanners('homepage'),
    fetchCategories(),
    fetchSubCategories(),
    fetchProducts({ limit: 8, sort: 'newest' }),
    fetchNav(),
    fetchSettings(),
  ]);

  const siteName = settings['site_name'] ?? 'NOOREMOON';
  const announcementActive = settings['announcement_bar_active'] === 'true';
  const announcementText = settings['announcement_bar_text'] ?? '';

  const subsByCat = subCategories.reduce<Record<string, SubCategory[]>>((acc, sub) => {
    if (!acc[sub.categoryId]) acc[sub.categoryId] = [];
    acc[sub.categoryId].push(sub);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        nav={nav}
        siteName={siteName}
        supportEmail={settings['support_email']}
        announcementText={announcementActive ? announcementText : undefined}
      />

      <main className="flex-1">
        {/* Hero: 2-column banner grid */}
        {banners.length > 0 && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-[#e5e5e5]">
            {banners.slice(0, 2).map((banner, i) => (
              <Link
                key={banner.id}
                href={banner.linkUrl ?? '#'}
                className="relative block overflow-hidden group"
                style={{ aspectRatio: banners.length === 1 ? '16/7' : '4/3' }}
              >
                <Image
                  src={banner.imageUrl}
                  alt={banner.title}
                  fill
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  priority={i === 0}
                  sizes={banners.length === 1 ? '100vw' : '(max-width: 640px) 100vw, 50vw'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-[10px] uppercase tracking-widest opacity-80 mb-1">New Collection</p>
                  <h2 className="text-xl sm:text-3xl font-bold leading-tight">{banner.title}</h2>
                  {banner.subtitle && (
                    <p className="text-sm mt-1.5 opacity-80 max-w-xs">{banner.subtitle}</p>
                  )}
                  <span className="inline-block mt-4 text-[10px] font-semibold uppercase tracking-widest border-b border-white pb-0.5">
                    Shop Now
                  </span>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Category sections — one per category with horizontal subcategory scroll */}
        {categories.map(category => {
          const subs = subsByCat[category.id] ?? [];
          if (subs.length === 0) return null;
          return (
            <section key={category.id} className="py-10 max-w-[1440px] mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111]">
                  {category.name}
                </h2>
                <Link
                  href={`/c/${category.slug}`}
                  className="text-xs text-[#6b6b6b] hover:text-[#111] transition-colors"
                >
                  View All →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {subs.map(sub => (
                  <Link
                    key={sub.id}
                    href={`/s/${sub.slug}`}
                    className="shrink-0 w-[150px] sm:w-[180px] group"
                  >
                    <div className="relative overflow-hidden bg-[#f7f7f7]" style={{ aspectRatio: '3/4' }}>
                      {sub.heroImageUrl ? (
                        <Image
                          src={sub.heroImageUrl}
                          alt={sub.name}
                          fill
                          className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                          sizes="180px"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#ebebeb]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      <p className="absolute bottom-3 left-3 text-white text-sm font-medium leading-tight">
                        {sub.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {/* New Arrivals grid */}
        {newArrivals.data.length > 0 && (
          <section className="py-10 max-w-[1440px] mx-auto px-4 sm:px-6 border-t border-[#f0f0f0]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111]">New Arrivals</h2>
              <Link href="/c/men" className="text-xs text-[#6b6b6b] hover:text-[#111] transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
              {newArrivals.data.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Feature strip */}
        <section className="border-t border-[#f0f0f0] bg-[#f7f7f7] py-10">
          <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              ['Free Shipping', 'On orders over $150'],
              ['Easy Returns', '7-day exchange window'],
              ['Secure Payment', 'Encrypted checkout'],
              ['Customer Support', 'Mon–Fri, 9am–6pm'],
            ].map(([title, desc]) => (
              <div key={title}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#111] mb-1">{title}</p>
                <p className="text-xs text-[#6b6b6b]">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer
        nav={nav}
        siteName={siteName}
        instagram={settings['instagram_url']}
        facebook={settings['facebook_url']}
        supportEmail={settings['support_email']}
      />
    </div>
  );
}
