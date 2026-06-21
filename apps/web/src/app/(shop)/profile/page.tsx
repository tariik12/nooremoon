'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/store';
import { logout } from '@/store/authSlice';
import { clearTokens } from '@/lib/auth';
import {
  fetchMyOrders,
  fetchWishlist,
  fetchActivePromotions,
  removeFromWishlist,
  formatPrice,
  type Order,
  type WishlistItem,
  type Promotion,
} from '@/lib/api';

type Tab = 'orders' | 'wishlist' | 'offers' | 'account';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  RETURN_REQUESTED: 'bg-orange-100 text-orange-800',
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((s: RootState) => s.auth);

  const [tab, setTab] = useState<Tab>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  const loadOrders = useCallback(
    async (page: number) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const res = await fetchMyOrders(accessToken, page);
        setOrders(res.data);
        setOrdersTotal(res.total);
        setOrdersPage(page);
      } finally {
        setLoading(false);
      }
    },
    [accessToken],
  );

  const loadWishlist = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      setWishlist(await fetchWishlist(accessToken));
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    try {
      setPromotions(await fetchActivePromotions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'orders') loadOrders(1);
    if (tab === 'wishlist') loadWishlist();
    if (tab === 'offers') loadPromotions();
  }, [tab, loadOrders, loadWishlist, loadPromotions]);

  async function handleRemoveWishlist(productId: string) {
    if (!accessToken) return;
    await removeFromWishlist(accessToken, productId);
    setWishlist((prev) => prev.filter((w) => w.productId !== productId));
  }

  function handleLogout() {
    clearTokens();
    dispatch(logout());
    router.push('/');
  }

  if (!user) return null;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'orders', label: 'Orders' },
    { id: 'wishlist', label: 'Wishlist' },
    { id: 'offers', label: 'Offers' },
    { id: 'account', label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-black underline underline-offset-2"
          >
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-8">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-black text-black'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading orders…</div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-sm mb-4">No orders yet.</p>
                <Link href="/" className="text-sm underline underline-offset-2">
                  Start shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-lg p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatPrice(order.totalCents)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm text-gray-600">
                          <span>
                            {item.productName}
                            {item.size ? ` — ${item.size}` : ''}
                            {item.colour ? ` / ${item.colour}` : ''}
                            {' ×'} {item.quantity}
                          </span>
                          <span className="text-gray-900">{formatPrice(item.totalCents)}</span>
                        </div>
                      ))}
                    </div>

                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 mt-3">
                        Shipping to {order.shippingAddress.fullName},{' '}
                        {order.shippingAddress.city}, {order.shippingAddress.country}
                      </p>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {ordersTotal > 10 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <button
                      disabled={ordersPage === 1}
                      onClick={() => loadOrders(ordersPage - 1)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-500">
                      Page {ordersPage} of {Math.ceil(ordersTotal / 10)}
                    </span>
                    <button
                      disabled={ordersPage >= Math.ceil(ordersTotal / 10)}
                      onClick={() => loadOrders(ordersPage + 1)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Wishlist Tab */}
        {tab === 'wishlist' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading wishlist…</div>
            ) : wishlist.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-sm mb-4">Your wishlist is empty.</p>
                <Link href="/" className="text-sm underline underline-offset-2">
                  Browse products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {wishlist.map((item) => {
                  const cover = item.product.images?.find((img: any) => img.isCover) ?? item.product.images?.[0];
                  return (
                    <div key={item.id} className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden">
                      <div className="aspect-[3/4] relative bg-gray-50">
                        {cover ? (
                          <Image
                            src={cover.url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100" />
                        )}
                        <button
                          onClick={() => handleRemoveWishlist(item.productId)}
                          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove from wishlist"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="p-3">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="text-sm font-medium hover:underline line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-sm text-gray-700 mt-1">
                          {formatPrice(item.product.finalPriceCents)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Offers Tab */}
        {tab === 'offers' && (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-400 text-sm">Loading offers…</div>
            ) : promotions.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 text-sm">No active offers right now. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className={`rounded-lg p-5 border ${promo.isFlashSale ? 'bg-black text-white border-black' : 'bg-white border-gray-100'}`}
                  >
                    {promo.isFlashSale && (
                      <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-2 block">
                        Flash Sale
                      </span>
                    )}
                    <h3 className="font-semibold text-base">{promo.name}</h3>
                    <p className={`text-sm mt-1 ${promo.isFlashSale ? 'text-white/70' : 'text-gray-500'}`}>
                      {promo.type === 'percent'
                        ? `${promo.discountPercent}% off`
                        : `${formatPrice(promo.discountCents ?? 0)} off`}
                      {promo.minOrderCents
                        ? ` on orders over ${formatPrice(promo.minOrderCents)}`
                        : ''}
                    </p>
                    {promo.code && (
                      <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded font-mono text-sm font-semibold ${promo.isFlashSale ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {promo.code}
                      </div>
                    )}
                    {promo.endsAt && (
                      <p className={`text-xs mt-2 ${promo.isFlashSale ? 'text-white/50' : 'text-gray-400'}`}>
                        Ends {new Date(promo.endsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Account Tab */}
        {tab === 'account' && (
          <div className="max-w-md space-y-6">
            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-500">
                Personal Information
              </h2>
              <dl className="space-y-3">
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium">
                    {user.firstName} {user.lastName}
                  </dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium">{user.email}</dd>
                </div>
                {(user as any).phone && (
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-500">Phone</dt>
                    <dd className="font-medium">{(user as any).phone}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-5">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-gray-500">
                Account Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/login?tab=change-password"
                  className="block text-sm text-gray-700 hover:text-black underline underline-offset-2"
                >
                  Change password
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-sm text-gray-500 hover:text-black underline underline-offset-2"
                >
                  Sign out of all devices
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
