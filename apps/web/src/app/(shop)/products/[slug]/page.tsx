import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProduct, fetchProducts } from '@/lib/api';
import { formatPrice } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import AddToBagButton from './AddToBagButton';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  return {
    title: product ? product.name : 'Product',
    description: product?.description ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) notFound();

  const hasDiscount = product.discountPercent > 0;
  const images = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const primaryImg = images.find(i => i.isPrimary) ?? images[0];

  const related = await fetchProducts({
    subCategoryId: product.subCategory?.id ?? '',
    limit: 4,
  });
  const relatedProducts = related.data.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-[#6b6b6b] mb-6">
        <Link href="/" className="hover:text-[#111]">Home</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/c/${product.category.slug}`} className="hover:text-[#111]">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        {product.subCategory && (
          <>
            <Link href={`/s/${product.subCategory.slug}`} className="hover:text-[#111]">
              {product.subCategory.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[#111] line-clamp-1">{product.name}</span>
      </nav>

      {/* Main product layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_420px] gap-6 lg:gap-10">
        {/* Thumbnail column */}
        {images.length > 1 && (
          <div className="hidden lg:flex flex-col gap-2 max-h-[600px] overflow-y-auto scrollbar-hide">
            {images.map(img => (
              <div key={img.id} className="relative w-full shrink-0 bg-[#f7f7f7]" style={{ aspectRatio: '1/1' }}>
                <Image
                  src={img.url}
                  alt={img.altText ?? product.name}
                  fill
                  className="object-cover"
                  sizes="100px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="relative bg-[#f7f7f7] overflow-hidden" style={{ aspectRatio: '3/4' }}>
          {primaryImg ? (
            <Image
              src={primaryImg.url}
              alt={primaryImg.altText ?? product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full bg-[#ebebeb]" />
          )}

          {/* Badges */}
          {product.tier && (
            <span className="absolute top-3 right-3 bg-black/60 text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-1">
              {product.tier.name}
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-white text-[#cc0000] text-[9px] font-semibold px-2 py-1">
              {product.discountPercent}% OFF
            </span>
          )}
          {product.isCottocool && (
            <span className="absolute bottom-3 left-3 bg-[#1a5c4a] text-white text-[9px] font-semibold tracking-widest uppercase px-2 py-0.5">
              CottoCool
            </span>
          )}
        </div>

        {/* Mobile image strip */}
        {images.length > 1 && (
          <div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-hide col-span-full -mt-2">
            {images.slice(1).map(img => (
              <div key={img.id} className="relative shrink-0 w-20 h-20 bg-[#f7f7f7]">
                <Image src={img.url} alt={img.altText ?? product.name} fill className="object-cover" sizes="80px" />
              </div>
            ))}
          </div>
        )}

        {/* Product info */}
        <div className="flex flex-col">
          {/* Category / sub-category */}
          <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-1">
            {[product.category?.name, product.subCategory?.name].filter(Boolean).join(' / ')}
          </p>

          <h1 className="text-xl sm:text-2xl font-semibold text-[#111] leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            {hasDiscount ? (
              <>
                <span className="text-xl font-semibold text-[#cc0000]">
                  {formatPrice(product.finalPriceCents)}
                </span>
                <span className="text-sm text-[#aaa] line-through">
                  {formatPrice(product.basePriceCents)}
                </span>
                <span className="text-xs text-[#cc0000] font-medium">
                  Save {product.discountPercent}%
                </span>
              </>
            ) : (
              <span className="text-xl font-semibold text-[#111]">
                {formatPrice(product.basePriceCents)}
              </span>
            )}
          </div>

          {/* Add to bag (client component — handles variant selection) */}
          <AddToBagButton product={product} />

          {/* Delivery info */}
          <div className="mt-6 pt-6 border-t border-[#f0f0f0] space-y-2">
            <p className="text-xs text-[#6b6b6b] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="1"/>
                <path d="M5 11v4"/>
              </svg>
              Free shipping on orders over $150
            </p>
            <p className="text-xs text-[#6b6b6b] flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-3.96"/>
              </svg>
              7-day exchange window
            </p>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#111] mb-3">Description</h3>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Care */}
          {product.careInstructions && (
            <div className="mt-6 pt-6 border-t border-[#f0f0f0]">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#111] mb-3">Care Instructions</h3>
              <p className="text-sm text-[#6b6b6b] leading-relaxed">{product.careInstructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-10 border-t border-[#f0f0f0]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[#111] mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
