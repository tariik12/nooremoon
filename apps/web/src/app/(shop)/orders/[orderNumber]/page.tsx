'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

interface OrderItem {
  id: string;
  productName: string;
  size: string;
  colour: string | null;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: ShippingAddress | null;
  items: OrderItem[];
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API}/orders/${orderNumber}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Order not found');
        return r.json();
      })
      .then(setOrder)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-16 text-center">
        <p className="text-[13px] text-[#6b6b6b]">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-[700px] mx-auto px-4 py-16 text-center">
        <p className="text-[13px] text-[#cc0000] mb-4">{error || 'Order not found'}</p>
        <Link href="/" className="text-[12px] text-[#111] underline">Go home</Link>
      </div>
    );
  }

  const isCOD = order.paymentMethod === 'cod';
  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <div className="max-w-[700px] mx-auto px-4 sm:px-6 py-10">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-[#e8f5e9] flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a5c4a" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold text-[#111] mb-1">
          {isCOD ? 'Order Confirmed!' : 'Order Placed!'}
        </h1>
        <p className="text-[13px] text-[#6b6b6b]">
          {isCOD
            ? 'Your order has been confirmed. Pay when it arrives.'
            : 'Thank you for your order. We\'ll update you once it\'s processed.'}
        </p>
      </div>

      {/* Order number + status */}
      <div className="bg-white border border-[#e5e5e5] rounded-sm p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-0.5">Order Number</p>
            <p className="text-[15px] font-mono font-semibold text-[#111]">{order.orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-0.5">Status</p>
            <StatusBadge status={order.status} />
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-0.5">Payment</p>
            <p className="text-[12px] font-medium text-[#111] uppercase">
              {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-[#6b6b6b] mb-0.5">Date</p>
            <p className="text-[12px] text-[#111]">
              {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Order items */}
      <div className="bg-white border border-[#e5e5e5] rounded-sm overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-[#f0f0f0] bg-[#fafafa]">
          <p className="text-[11px] uppercase tracking-widest text-[#6b6b6b] font-medium">Items Ordered</p>
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-16 bg-[#f7f7f7] rounded-sm shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-[#aaa] font-mono">{item.sku.slice(-4)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#111] line-clamp-2">{item.productName}</p>
                <div className="flex gap-3 mt-0.5">
                  <span className="text-[11px] text-[#6b6b6b]">Size: {item.size}</span>
                  {item.colour && <span className="text-[11px] text-[#6b6b6b]">Colour: {item.colour}</span>}
                  <span className="text-[11px] text-[#6b6b6b]">Qty: {item.quantity}</span>
                </div>
              </div>
              <p className="text-[13px] font-medium text-[#111] shrink-0">{formatPrice(item.totalCents)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals + Address grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
        {/* Price breakdown */}
        <div className="bg-white border border-[#e5e5e5] rounded-sm p-5">
          <p className="text-[11px] uppercase tracking-widest text-[#6b6b6b] font-medium mb-4">Price Summary</p>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between">
              <span className="text-[#6b6b6b]">Subtotal</span>
              <span className="text-[#111]">{formatPrice(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6b6b6b]">Shipping</span>
              {order.shippingCents === 0
                ? <span className="text-[#1a5c4a] font-medium">Free</span>
                : <span className="text-[#111]">{formatPrice(order.shippingCents)}</span>}
            </div>
            <div className="flex justify-between font-semibold text-[15px] pt-2 border-t border-[#f0f0f0]">
              <span>Total</span>
              <span>{formatPrice(order.totalCents)}</span>
            </div>
            {isCOD && (
              <p className="text-[11px] text-[#e68a00] mt-2 bg-[#fff8e6] border border-[#ffe0a3] rounded-sm px-3 py-2">
                💵 Pay {formatPrice(order.totalCents)} in cash on delivery
              </p>
            )}
          </div>
        </div>

        {/* Shipping address */}
        {order.shippingAddress && (
          <div className="bg-white border border-[#e5e5e5] rounded-sm p-5">
            <p className="text-[11px] uppercase tracking-widest text-[#6b6b6b] font-medium mb-4">Deliver To</p>
            <div className="text-[13px] text-[#111] leading-relaxed">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              {order.shippingAddress.phone && <p className="text-[#6b6b6b]">{order.shippingAddress.phone}</p>}
              <p className="mt-1">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>
                {[order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.postalCode]
                  .filter(Boolean).join(', ')}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 text-center bg-[#111] text-white text-[12px] uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#333] transition-colors font-semibold"
        >
          Continue Shopping
        </Link>
        <Link
          href="/profile"
          className="flex-1 text-center border border-[#111] text-[#111] text-[12px] uppercase tracking-widest py-3.5 rounded-sm hover:bg-[#111] hover:text-white transition-colors font-semibold"
        >
          My Orders
        </Link>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending:          { bg: 'bg-[#fff8e6]', text: 'text-[#e68a00]', label: 'Pending' },
    confirmed:        { bg: 'bg-[#e8f5e9]', text: 'text-[#1a5c4a]', label: 'Confirmed' },
    processing:       { bg: 'bg-[#e3f0ff]', text: 'text-[#1a5fa8]', label: 'Processing' },
    shipped:          { bg: 'bg-[#e3f0ff]', text: 'text-[#1a5fa8]', label: 'Shipped' },
    out_for_delivery: { bg: 'bg-[#e3f0ff]', text: 'text-[#1a5fa8]', label: 'Out for Delivery' },
    delivered:        { bg: 'bg-[#e8f5e9]', text: 'text-[#1a5c4a]', label: 'Delivered' },
    cancelled:        { bg: 'bg-[#fff5f5]', text: 'text-[#cc0000]', label: 'Cancelled' },
  };
  const c = config[status] ?? config.pending;
  return (
    <span className={`text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-sm ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
