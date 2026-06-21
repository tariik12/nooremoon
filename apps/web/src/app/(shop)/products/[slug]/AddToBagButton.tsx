'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { initSession, setCart } from '@/store/cartSlice';
import { apiAddToCart } from '@/lib/api';
import type { Product } from '@/lib/api';

export default function AddToBagButton({ product }: { product: Product }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const sessionId = useSelector((s: RootState) => s.cart.sessionId);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'adding' | 'added'>('idle');

  const colours = [...new Set(product.variants?.filter(v => v.colour).map(v => v.colour!) ?? [])];
  const sizes = [...new Set(product.variants?.map(v => v.size) ?? [])];
  const outOfStock = product.stockTotal === 0;

  const selectedVariant = product.variants?.find(
    v => v.size === selectedSize && (!selectedColour || v.colour === selectedColour),
  );

  function isSizeAvailable(size: string) {
    if (!colours.length) return (product.variants?.find(v => v.size === size)?.stockQty ?? 0) > 0;
    if (!selectedColour) return product.variants?.some(v => v.size === size && (v.stockQty ?? 0) > 0);
    return (product.variants?.find(v => v.size === size && v.colour === selectedColour)?.stockQty ?? 0) > 0;
  }

  function getSid() {
    dispatch(initSession());
    if (sessionId) return sessionId;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('cart_session_id') : null;
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    if (typeof window !== 'undefined') localStorage.setItem('cart_session_id', fresh);
    return fresh;
  }

  async function handleAdd(redirect = false) {
    setError('');
    if (colours.length && !selectedColour) { setError('Please select a colour'); return; }
    if (!selectedSize) { setError('Please select a size'); return; }
    if (!selectedVariant || (selectedVariant.stockQty ?? 0) === 0) { setError('This size is out of stock'); return; }

    setStatus('adding');
    try {
      const cart = await apiAddToCart(selectedVariant.id, 1, getSid());
      dispatch(setCart(cart));
      if (redirect) {
        router.push('/shopping-bag');
      } else {
        setStatus('added');
        setTimeout(() => setStatus('idle'), 2500);
      }
    } catch (err) {
      setError((err as Error).message ?? 'Could not add to bag');
      setStatus('idle');
    }
  }

  if (outOfStock) {
    return (
      <div className="space-y-3">
        <button disabled className="w-full py-3 border border-[#e5e5e5] text-sm text-[#aaa] tracking-widest uppercase cursor-not-allowed">
          Sold Out
        </button>
        <button className="w-full py-3 border border-[#111] text-sm text-[#111] tracking-widest uppercase hover:bg-[#111] hover:text-white transition-colors">
          Notify Me
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Colour selector */}
      {colours.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#111] mb-2">
            Colour{selectedColour ? `: ${selectedColour}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {colours.map(colour => (
              <button
                key={colour}
                onClick={() => { setSelectedColour(colour); setSelectedSize(null); setError(''); }}
                className={`text-xs px-3 py-2 border transition-colors ${
                  selectedColour === colour
                    ? 'border-[#111] bg-[#111] text-white'
                    : 'border-[#e5e5e5] text-[#111] hover:border-[#111]'
                }`}
              >
                {colour}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Size selector */}
      {sizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#111] mb-2">
            Size{selectedSize ? `: ${selectedSize}` : ''}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => {
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  onClick={() => { if (available) { setSelectedSize(size); setError(''); } }}
                  disabled={!available}
                  className={`min-w-[44px] px-3 py-2 text-xs border transition-colors ${
                    selectedSize === size
                      ? 'border-[#111] bg-[#111] text-white'
                      : available
                        ? 'border-[#e5e5e5] text-[#111] hover:border-[#111]'
                        : 'border-[#e5e5e5] text-[#ccc] line-through cursor-not-allowed'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-[#cc0000]">{error}</p>}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => handleAdd(false)}
          disabled={status !== 'idle'}
          className={`flex-1 py-3.5 text-sm font-semibold uppercase tracking-widest transition-colors ${
            status === 'added'
              ? 'bg-[#1a5c4a] text-white border border-[#1a5c4a]'
              : 'bg-[#111] text-white border border-[#111] hover:bg-white hover:text-[#111]'
          }`}
        >
          {status === 'adding' ? 'Adding…' : status === 'added' ? '✓ Added to Bag' : 'Add to Bag'}
        </button>
        <button
          onClick={() => handleAdd(true)}
          disabled={status !== 'idle'}
          className="flex-1 py-3.5 text-sm font-semibold uppercase tracking-widest border border-[#111] text-[#111] hover:bg-[#111] hover:text-white transition-colors disabled:opacity-50"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
