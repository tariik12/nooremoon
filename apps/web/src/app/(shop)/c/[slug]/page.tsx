import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCategories, fetchSubCategories, fetchProducts } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categories = await fetchCategories();
  const cat = categories.find(c => c.slug === slug);
  return { title: cat ? `${cat.name} Collection` : 'Category' };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort, page } = await searchParams;

  const [categories, subCategories] = await Promise.all([
    fetchCategories(),
    fetchSubCategories(),
  ]);

  const category = categories.find(c => c.slug === slug);
  if (!category) notFound();

  const catSubs = subCategories.filter(s => s.categoryId === category.id);
  const currentPage = parseInt(page ?? '1', 10);

  const products = await fetchProducts({
    categoryId: category.id,
    ...(sort ? { sort: sort as 'price_asc' | 'price_desc' | 'newest' } : {}),
    page: currentPage,
    limit: 24,
  });

  const totalPages = Math.ceil(products.total / 24);

  return (
    <div className="flex min-h-[70vh]">
      {/* Left sidebar */}
      <aside className="hidden md:block w-[200px] lg:w-[220px] shrink-0 border-r border-[#e5e5e5] pt-8 pb-8 px-6">
        <nav>
          <ul className="space-y-4">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link
                  href={`/c/${cat.slug}`}
                  className={`text-sm transition-colors ${
                    cat.slug === slug
                      ? 'font-semibold text-[#111]'
                      : 'text-[#6b6b6b] hover:text-[#111]'
                  }`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 pt-8 pb-12 px-4 lg:px-8">
        {/* Mobile category selector */}
        <div className="md:hidden mb-6 flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/c/${cat.slug}`}
              className={`shrink-0 text-sm px-4 py-2 border transition-colors ${
                cat.slug === slug
                  ? 'border-[#111] text-[#111] bg-[#111] text-white'
                  : 'border-[#e5e5e5] text-[#6b6b6b] hover:border-[#111]'
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Page title */}
        <h1 className="text-xl font-semibold mb-6">{category.name}</h1>

        {/* Subcategory image tiles */}
        {catSubs.length > 0 && (
          <div className="mb-10">
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 sm:flex-wrap sm:overflow-visible">
              {/* All tile */}
              <Link
                href={`/c/${slug}`}
                className="shrink-0 w-[140px] sm:w-[160px] group"
              >
                <div
                  className="relative overflow-hidden bg-[#f7f7f7] flex items-end p-3"
                  style={{ aspectRatio: '3/4' }}
                >
                  <p className="text-sm text-[#111] font-medium">All</p>
                </div>
              </Link>
              {catSubs.map(sub => (
                <Link
                  key={sub.id}
                  href={`/s/${sub.slug}`}
                  className="shrink-0 w-[140px] sm:w-[160px] group"
                >
                  <div className="relative overflow-hidden bg-[#f7f7f7]" style={{ aspectRatio: '3/4' }}>
                    {sub.heroImageUrl ? (
                      <Image
                        src={sub.heroImageUrl}
                        alt={sub.name}
                        fill
                        className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        sizes="160px"
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
          </div>
        )}

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6 border-b border-[#f0f0f0] pb-4">
          <p className="text-xs text-[#6b6b6b]">{products.total} items</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#6b6b6b]">Sort by</span>
            <div className="flex gap-2">
              {[
                { label: 'Default', value: '' },
                { label: 'Price: Low', value: 'price_asc' },
                { label: 'Price: High', value: 'price_desc' },
                { label: 'Newest', value: 'newest' },
              ].map(opt => (
                <Link
                  key={opt.value}
                  href={`/c/${slug}?sort=${opt.value}`}
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
                href={`/c/${slug}?page=${p}${sort ? `&sort=${sort}` : ''}`}
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
