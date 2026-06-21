'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice, type Order } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

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

const STATUS_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function OrderProgress({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.indexOf(status);
  if (currentIdx < 0 || status === 'CANCELLED') return null;
  return (
    <div className="flex items-center mt-4 pt-4 border-t border-gray-50">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${done ? active ? 'bg-black text-white ring-2 ring-black/20' : 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                {done && !active ? '✓' : i + 1}
              </div>
              <p className={`text-[8px] mt-1 text-center leading-tight w-12 ${done ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                {step.replace(/_/g, ' ')}
              </p>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-4 mx-0.5 ${i < currentIdx ? 'bg-black' : 'bg-gray-100'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, expanded, onToggle }: { order: Order; expanded: boolean; onToggle: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      {/* Summary row — always visible */}
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold font-mono">{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {' · '}
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <span className="text-sm font-semibold">{formatPrice(order.totalCents)}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-50">
          <OrderProgress status={order.status} />

          <div className="space-y-2 mt-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.productName}
                  {item.size ? <span className="text-gray-400"> — {item.size}</span> : ''}
                  {item.colour ? <span className="text-gray-400"> / {item.colour}</span> : ''}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </span>
                <span className="font-medium ml-3 shrink-0">{formatPrice(item.totalCents)}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Subtotal</span><span>{formatPrice(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shipping</span>
              <span>{order.shippingCents === 0 ? 'Free' : formatPrice(order.shippingCents)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-1">
              <span>Total</span><span>{formatPrice(order.totalCents)}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
              {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{' '}
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleLookup(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setOrders([]);
    setSearched(false);
    setExpanded(null);
    try {
      const res = await fetch(`${API}/orders/track?phone=${encodeURIComponent(phone.trim())}`);
      if (!res.ok) { setError('Something went wrong. Please try again.'); return; }
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : [data]);
      setSearched(true);
      // Auto-expand the most recent order
      if (Array.isArray(data) && data.length > 0) setExpanded(data[0].id);
    } catch {
      setError('Cannot connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-xl mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Your Orders</h1>
        <p className="text-sm text-gray-500 mb-8">
          Enter the phone number you used at checkout to see all your orders.
        </p>

        <form onSubmit={handleLookup} className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
          <div className="flex gap-2">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01712345678"
              type="tel"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shrink-0"
            >
              {loading ? '…' : 'Search'}
            </button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </form>

        {searched && (
          orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-3">No orders found for this phone number.</p>
              <Link href="/" className="text-sm underline underline-offset-2">Browse products</Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  expanded={expanded === order.id}
                  onToggle={() => setExpanded(expanded === order.id ? null : order.id)}
                />
              ))}
            </div>
          )
        )}

        <p className="text-xs text-center text-gray-400 mt-10">
          Have an account?{' '}
          <Link href="/login" className="underline hover:text-black">Sign in</Link>
          {' '}to see all your orders in one place.
        </p>
      </div>
    </div>
  );
}
