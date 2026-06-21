import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchSubCategory, fetchSubCategories, fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const sub = await fetchSubCategory(slug);
  return { title: sub ? `${sub.name} — ${sub.category?.name}` : 'Collection' };
}

export default async function SubCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;

  const sub = await fetchSubCategory(slug);
  if (!sub) notFound();

  const currentPage = parseInt(page ?? '1', 10);

  const [siblings, products] = await Promise.all([
    fetchSubCategories(sub.categoryId),
    fetchProducts({
      subCategoryId: sub.id,
      ...(sort ? { sort: sort as 'price_asc' | 'price_desc' | 'newest' } : {}),
      page: currentPage,
      limit: 24,
    }),
  ]);

  const totalPages = Math.ceil(products.total / 24);

  return (
    <div className="flex min-h-[70vh]">
      {/* Left sidebar */}
      <aside className="hidden md:block w-[200px] lg:w-[220px] shrink-0 border-r border-[#e5e5e5] pt-8 pb-8 px-6">
        <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-4">
          {sub.category?.name}
        </p>
        <nav>
          <ul className="space-y-3">
            <li>
              <Link
                href={`/c/${sub.category?.slug}`}
                className="text-sm text-[#6b6b6b] hover:text-[#111] transition-colors"
              >
                All {sub.category?.name}
              </Link>
            </li>
            {siblings.map(s => (
              <li key={s.id}>
                <Link
                  href={`/s/${s.slug}`}
                  className={`text-sm transition-colors ${
                    s.slug === slug
                      ? 'font-semibold text-[#111]'
                      : 'text-[#6b6b6b] hover:text-[#111]'
                  }`}
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 pt-8 pb-12 px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#6b6b6b] mb-4">
          <Link href="/" className="hover:text-[#111]">Home</Link>
          <span>/</span>
          <Link href={`/c/${sub.category?.slug}`} className="hover:text-[#111]">
            {sub.category?.name}
          </Link>
          <span>/</span>
          <span className="text-[#111]">{sub.name}</span>
        </nav>

        {/* Category hero image */}
        {sub.heroImageUrl && (
          <div className="relative w-full h-[200px] sm:h-[280px] overflow-hidden mb-8 bg-[#f7f7f7]">
            <Image
              src={sub.heroImageUrl}
              alt={sub.name}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/30 flex items-end p-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{sub.name}</h1>
            </div>
          </div>
        )}

        {!sub.heroImageUrl && (
          <h1 className="text-xl font-semibold mb-6">{sub.name}</h1>
        )}

        {/* Mobile sibling navigation */}
        <div className="md:hidden mb-6 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <Link
            href={`/c/${sub.category?.slug}`}
            className="shrink-0 text-xs px-3 py-1.5 border border-[#e5e5e5] text-[#6b6b6b] hover:border-[#111]"
          >
            All
          </Link>
          {siblings.map(s => (
            <Link
              key={s.id}
              href={`/s/${s.slug}`}
              className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
                s.slug === slug
                  ? 'border-[#111] bg-[#111] text-white'
                  : 'border-[#e5e5e5] text-[#6b6b6b] hover:border-[#111]'
              }`}
            >
              {s.name}
            </Link>
          ))}
        </div>

        {/* Filter + sort bar */}
        <div className="flex items-center justify-between mb-6 border-b border-[#f0f0f0] pb-4">
          <p className="text-xs text-[#6b6b6b]">{products.total} items</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b6b6b] hidden sm:block">Sort by</span>
            <div className="flex gap-1 sm:gap-2">
              {[
                { label: 'Default', value: '' },
                { label: 'Price ↑', value: 'price_asc' },
                { label: 'Price ↓', value: 'price_desc' },
                { label: 'Newest', value: 'newest' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/s/${slug}?sort=${opt.value}`}
                  className={`text-xs px-2 py-1 border transition-colors ${
                    (sort ?? '') === opt.value
                      ? 'border-[#111] bg-[#111] text-white'
                      : 'border-[#e5e5e5] text-[#6b6b6b] hover:border-[#111] hover:text-[#111]'
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Product grid */}
        {products.data.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {products.data.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#6b6b6b] text-center py-16">No products found.</p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Link
                key={p}
                href={`/s/${slug}?page=${p}${sort ? `&sort=${sort}` : ''}`}
                className={`w-8 h-8 flex items-center justify-center text-xs border transition-colors ${
                  p === currentPage
                    ? 'border-[#111] bg-[#111] text-white'
                    : 'border-[#e5e5e5] text-[#6b6b6b] hover:border-[#111]'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
