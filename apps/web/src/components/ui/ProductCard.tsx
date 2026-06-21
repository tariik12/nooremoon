'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { initSession, setCart, setLoading } from '@/store/cartSlice';
import { apiAddToCart } from '@/lib/api';
import type { Product } from '@/lib/api';
import { formatPrice } from '@/lib/api';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const router = useRouter();
  const dispatch = useDispatch();
  const sessionId = useSelector((s: RootState) => s.cart.sessionId);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const primary = product.images.find(i => i.isPrimary) ?? product.images[0];
  const secondary = product.images.find(i => !i.isPrimary);
  const hasDiscount = product.discountPercent > 0;
  const soldOut = product.stockTotal === 0;

  // Pick first available variant automatically for quick-add
  const defaultVariant = product.variants?.[0];

  async function handleAdd(e: React.MouseEvent, redirect = false) {
    e.preventDefault();
    if (soldOut || adding) return;

    // No variant loaded (list view) — send to PDP for size selection
    if (!defaultVariant) {
      router.push(`/products/${product.slug}`);
      return;
    }

    dispatch(initSession());
    const sid = sessionId || (typeof window !== 'undefined'
      ? localStorage.getItem('cart_session_id') || crypto.randomUUID()
      : crypto.randomUUID());

    setAdding(true);
    dispatch(setLoading(true));
    try {
      const cart = await apiAddToCart(defaultVariant.id, 1, sid);
      dispatch(setCart(cart));
      if (redirect) {
        router.push('/shopping-bag');
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    } catch {
      router.push(`/products/${product.slug}`);
    } finally {
      setAdding(false);
      dispatch(setLoading(false));
    }
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f7f7f7]">
        {primary ? (
          <>
            <Image
              src={primary.url}
              alt={primary.altText ?? product.name}
              fill
              className={`object-cover transition-opacity duration-500 ${secondary ? 'group-hover:opacity-0' : ''}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {secondary && (
              <Image
                src={secondary.url}
                alt={secondary.altText ?? product.name}
                fill
                className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-[#ebebeb]" />
        )}

        {/* Tier badge */}
        {product.tier && (
          <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-semibold tracking-[0.12em] uppercase px-2 py-1">
            {product.tier.name}
          </span>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-white text-[#cc0000] text-[9px] font-semibold tracking-wide px-2 py-1">
            {product.discountPercent}% OFF
          </span>
        )}

        {/* CottoCool tag */}
        {product.isCottocool && (
          <span className="absolute bottom-2 left-2 bg-[#1a5c4a] text-white text-[8px] font-semibold tracking-[0.12em] uppercase px-2 py-0.5">
            CottoCool
          </span>
        )}

        {/* Sold out overlay */}
        {soldOut && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-white text-[#111] text-[10px] font-semibold tracking-[0.1em] uppercase px-3 py-1.5 shadow-sm">
              Sold Out
            </span>
          </div>
        )}

        {/* Hover action buttons */}
        {!soldOut && (
          <div className="absolute bottom-0 left-0 right-0 flex opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => handleAdd(e, false)}
              disabled={adding}
              className="flex-1 bg-white text-[#111] text-[10px] font-semibold tracking-[0.1em] uppercase py-2.5 hover:bg-[#111] hover:text-white transition-colors disabled:opacity-60 border-r border-[#e5e5e5]"
            >
              {added ? '✓ Added' : adding ? '…' : 'Add to Bag'}
            </button>
            <button
              onClick={(e) => handleAdd(e, true)}
              disabled={adding}
              className="flex-1 bg-[#111] text-white text-[10px] font-semibold tracking-[0.1em] uppercase py-2.5 hover:bg-[#333] transition-colors disabled:opacity-60"
            >
              Buy Now
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-2">
        <p className="text-[10px] text-[#6b6b6b] mb-0.5">{product.subCategory?.name}</p>
        <p className="text-xs text-[#111] leading-snug line-clamp-2">{product.name}</p>
        <div className="flex items-baseline gap-2 mt-1">
          {hasDiscount ? (
            <>
              <span className="text-xs font-medium text-[#cc0000]">{formatPrice(product.finalPriceCents)}</span>
              <span className="text-[10px] text-[#aaa] line-through">{formatPrice(product.basePriceCents)}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-[#111]">{formatPrice(product.basePriceCents)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
