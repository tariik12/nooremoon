'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { setCart, initSession, setLoading } from '@/store/cartSlice';
import { apiUpdateCartItem, apiRemoveCartItem, formatPrice } from '@/lib/api';
import type { CartItem } from '@/store/cartSlice';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export default function ShoppingBagPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { items, subtotalCents, itemCount, sessionId, loading } = useSelector(
    (s: RootState) => s.cart,
  );
  const [hydrated, setHydrated] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  // Load cart from API on mount
  const loadCart = useCallback(async () => {
    dispatch(initSession());
    const sid =
      sessionId ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('cart_session_id') ?? ''
        : '');
    if (!sid) { setHydrated(true); return; }
    try {
      dispatch(setLoading(true));
      const res = await fetch(`${API}/cart`, {
        headers: { 'x-session-id': sid },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        dispatch(setCart(data));
      }
    } finally {
      dispatch(setLoading(false));
      setHydrated(true);
    }
  }, [dispatch, sessionId]);

  useEffect(() => { loadCart(); }, [loadCart]);

  function getSid() {
    return (
      sessionId ||
      (typeof window !== 'undefined'
        ? localStorage.getItem('cart_session_id') ?? ''
        : '')
    );
  }

  async function handleRemove(itemId: string) {
    setRemoving(itemId);
    try {
      const cart = await apiRemoveCartItem(itemId, getSid());
      dispatch(setCart(cart));
    } finally {
      setRemoving(null);
    }
  }

  async function handleQtyChange(item: CartItem, newQty: number) {
    if (newQty < 1) { handleRemove(item.id); return; }
    setUpdating(item.id);
    try {
      const cart = await apiUpdateCartItem(item.id, newQty, getSid());
      dispatch(setCart(cart));
    } finally {
      setUpdating(null);
    }
  }

  // Pricing calculations
  const SHIPPING_FREE_THRESHOLD_CENTS = 15000; // $150 free shipping
  const SHIPPING_FLAT_CENTS = 800; // $8 flat rate
  const shippingCents = subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
  const totalCents = subtotalCents + shippingCents;
  const progressPct = Math.min(100, (subtotalCents / SHIPPING_FREE_THRESHOLD_CENTS) * 100);
  const remainingForFreeShipping = SHIPPING_FREE_THRESHOLD_CENTS - subtotalCents;

  if (!hydrated) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-[13px] text-[#6b6b6b]">Loading your bag…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="mb-6">
          <svg className="mx-auto w-16 h-16 text-[#e5e5e5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h1 className="text-[20px] font-semibold text-[#111] mb-2">Your bag is empty</h1>
        <p className="text-[13px] text-[#6b6b6b] mb-8">Add some items to get started.</p>
        <Link
          href="/"
          className="inline-block bg-[#111] text-white text-[12px] uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-[#333] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#111]">Shopping Bag</h1>
        <p className="text-[13px] text-[#6b6b6b] mt-0.5">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
      </div>

      {/* Free shipping progress bar */}
      {subtotalCents < SHIPPING_FREE_THRESHOLD_CENTS && (
        <div className="mb-6 bg-[#f7f7f7] border border-[#e5e5e5] rounded-sm px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] text-[#6b6b6b]">
              Add <span className="font-semibold text-[#111]">{formatPrice(remainingForFreeShipping)}</span> more for free shipping
            </p>
            <p className="text-[10px] text-[#aaa]">{Math.round(progressPct)}%</p>
          </div>
          <div className="h-1 bg-[#e5e5e5] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#111] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
      {subtotalCents >= SHIPPING_FREE_THRESHOLD_CENTS && (
        <div className="mb-6 bg-[#e8f5e9] border border-[#a5d6a7] rounded-sm px-4 py-2.5">
          <p className="text-[12px] text-[#1a5c4a] font-medium">🎉 You've unlocked free shipping!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Cart items */}
        <div className="space-y-0 border border-[#e5e5e5] rounded-sm overflow-hidden bg-white divide-y divide-[#f0f0f0]">
          {items.map((item) => (
            <CartRow
              key={item.id}
              item={item}
              removing={removing === item.id}
              updating={updating === item.id}
              onRemove={() => handleRemove(item.id)}
              onQtyChange={(qty) => handleQtyChange(item, qty)}
            />
          ))}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="bg-white border border-[#e5e5e5] rounded-sm p-6">
            <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#111] mb-5">
              Order Summary
            </h2>

            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className="text-[#111] font-medium">{formatPrice(subtotalCents)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-[#6b6b6b]">Shipping</span>
                {shippingCents === 0 ? (
                  <span className="text-[#1a5c4a] font-medium">Free</span>
                ) : (
                  <span className="text-[#111]">{formatPrice(shippingCents)}</span>
                )}
              </div>

              <div className="pt-3 border-t border-[#e5e5e5] flex justify-between text-[15px]">
                <span className="font-semibold text-[#111]">Total</span>
                <span className="font-semibold text-[#111]">{formatPrice(totalCents)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              disabled={loading}
              className="mt-6 w-full bg-[#111] text-white text-[12px] uppercase tracking-widest py-4 rounded-sm hover:bg-[#333] disabled:opacity-50 transition-colors font-semibold"
            >
              Proceed to Checkout
            </button>

            <Link
              href="/"
              className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-[#6b6b6b] hover:text-[#111] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Continue Shopping
            </Link>
          </div>

          {/* Trust signals */}
          <div className="bg-white border border-[#e5e5e5] rounded-sm p-5 space-y-3">
            {[
              { icon: '🔒', text: 'Secure checkout — SSL encrypted' },
              { icon: '📦', text: 'Free shipping on orders over $150' },
              { icon: '🔄', text: '7-day exchange window' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-base">{icon}</span>
                <span className="text-[11px] text-[#6b6b6b]">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cart row component ────────────────────────────────────────────────────────

function CartRow({
  item,
  removing,
  updating,
  onRemove,
  onQtyChange,
}: {
  item: CartItem;
  removing: boolean;
  updating: boolean;
  onRemove: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const imgSrc = item.product?.imageUrl
    ? item.product.imageUrl.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}${item.product.imageUrl}`
      : item.product.imageUrl
    : null;

  return (
    <div className={`flex gap-4 p-4 transition-opacity ${removing ? 'opacity-40' : ''}`}>
      {/* Image */}
      <Link href={`/products/${item.product?.slug}`} className="shrink-0">
        <div className="relative w-20 h-28 bg-[#f7f7f7] rounded-sm overflow-hidden">
          {imgSrc ? (
            <Image src={imgSrc} alt={item.product?.name ?? ''} fill className="object-cover" sizes="80px" />
          ) : (
            <div className="w-full h-full bg-[#ebebeb]" />
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/products/${item.product?.slug}`}
              className="text-[13px] font-medium text-[#111] hover:underline leading-tight line-clamp-2"
            >
              {item.product?.name}
            </Link>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
              {item.variant?.size && (
                <span className="text-[11px] text-[#6b6b6b]">Size: {item.variant.size}</span>
              )}
              {item.variant?.colour && (
                <span className="text-[11px] text-[#6b6b6b]">Colour: {item.variant.colour}</span>
              )}
            </div>
          </div>
          <p className="text-[13px] font-semibold text-[#111] shrink-0">
            {formatPrice(item.totalCents)}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {/* Quantity stepper */}
          <div className="flex items-center border border-[#e5e5e5] rounded-sm">
            <button
              onClick={() => onQtyChange(item.quantity - 1)}
              disabled={updating}
              className="w-8 h-8 flex items-center justify-center text-[#6b6b6b] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors disabled:opacity-40 text-base"
            >
              −
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-[13px] font-medium text-[#111] border-x border-[#e5e5e5]">
              {updating ? '…' : item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(item.quantity + 1)}
              disabled={updating || item.quantity >= (item.variant?.stockQty ?? 99)}
              className="w-8 h-8 flex items-center justify-center text-[#6b6b6b] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors disabled:opacity-40 text-base"
            >
              +
            </button>
          </div>

          {/* Unit price + remove */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#aaa]">{formatPrice(item.unitPriceCents)} each</span>
            <button
              onClick={onRemove}
              disabled={removing}
              className="text-[11px] text-[#cc0000] hover:text-[#990000] transition-colors disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
