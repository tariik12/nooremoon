'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { formatPrice } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

const ALL_STATUSES = [
  'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED',
  'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED',
];

const NEXT_STATUSES: Record<string, string[]> = {
  PENDING:           ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:         ['PROCESSING', 'CANCELLED'],
  PROCESSING:        ['SHIPPED', 'CANCELLED'],
  SHIPPED:           ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY:  ['DELIVERED'],
  DELIVERED:         ['RETURN_REQUESTED'],
  RETURN_REQUESTED:  ['CANCELLED'],
  CANCELLED:         [],
};

const STATUS_COLORS: Record<string, string> = {
  PENDING:           'bg-yellow-100 text-yellow-800',
  CONFIRMED:         'bg-blue-100 text-blue-800',
  PROCESSING:        'bg-indigo-100 text-indigo-800',
  SHIPPED:           'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY:  'bg-violet-100 text-violet-800',
  DELIVERED:         'bg-green-100 text-green-800',
  CANCELLED:         'bg-red-100 text-red-800',
  RETURN_REQUESTED:  'bg-orange-100 text-orange-800',
};

interface OrderItem { id: string; productName: string; size: string; colour: string | null; quantity: number; unitPriceCents: number; totalCents: number; sku: string; }
interface Address { fullName: string; phone: string; addressLine1: string; city: string; country: string; }
interface HistoryEntry { id: string; fromStatus: string | null; toStatus: string; changedBy: string | null; note: string | null; createdAt: string; }
interface AdminOrder {
  id: string; orderNumber: string; status: string; paymentMethod: string | null; paymentStatus: string;
  subtotalCents: number; shippingCents: number; totalCents: number; currency: string;
  ivrStatus: string; trackingNumber: string | null; courierName: string | null;
  createdAt: string; items: OrderItem[]; shippingAddress: Address | null;
  user: { email: string; firstName: string | null; lastName: string | null } | null;
  statusHistory: HistoryEntry[];
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function AdminOrdersPage() {
  const token = useSelector((s: RootState) => s.auth.accessToken);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detail drawer
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status update
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [courier, setCourier] = useState('');

  const limit = 20;

  const load = useCallback(async (p: number, s: string, q: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (s) params.set('status', s);
      if (q) params.set('search', q);
      const res = await fetch(`${API}/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.data);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(page, statusFilter, search); }, [load, page, statusFilter, search]);

  function handleSearchChange(v: string) {
    setSearchInput(v);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  }

  async function openDetail(order: AdminOrder) {
    if (!token) return;
    setSelected(order);
    setNewStatus('');
    setStatusNote('');
    setTracking(order.trackingNumber ?? '');
    setCourier(order.courierName ?? '');
    setLoadingDetail(true);
    try {
      const res = await fetch(`${API}/admin/orders/${order.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSelected(await res.json());
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleUpdateStatus() {
    if (!token || !selected || !newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${API}/admin/orders/${selected.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || undefined,
          trackingNumber: tracking || undefined,
          courierName: courier || undefined,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelected(updated);
        setNewStatus('');
        setStatusNote('');
        load(page, statusFilter, search);
      }
    } finally {
      setUpdatingStatus(false);
    }
  }

  const nextStatuses = selected ? NEXT_STATUSES[selected.status] ?? [] : [];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search order #, name, phone, email…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-black"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
        >
          <option value="">All Statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">No orders found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="text-left px-5 py-3">Order</th>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Payment</th>
                  <th className="text-right px-4 py-3">Total</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.shippingAddress?.fullName ?? '—'}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress?.phone ?? order.user?.email ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600">{order.paymentMethod ?? '—'}</p>
                      <p className="text-xs text-gray-400">{order.paymentStatus}</p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(order.totalCents)}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetail(order)}
                        className="text-xs text-gray-500 hover:text-black underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex justify-center gap-2 pt-5">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page} of {Math.ceil(total / limit)}</span>
          <button disabled={page >= Math.ceil(total / limit)} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
            Next
          </button>
        </div>
      )}

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-lg shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <p className="font-mono text-sm font-semibold">{selected.orderNumber}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(selected.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-black text-xl leading-none">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {loadingDetail ? (
                <p className="text-sm text-gray-400 text-center py-10">Loading…</p>
              ) : (
                <>
                  {/* Status + badges */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={selected.status} />
                    <span className="text-xs text-gray-400">{selected.paymentMethod} · {selected.paymentStatus}</span>
                    {selected.ivrStatus !== 'not_triggered' && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">IVR: {selected.ivrStatus}</span>
                    )}
                  </div>

                  {/* Customer */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Customer</p>
                    <p className="text-sm font-medium">{selected.shippingAddress?.fullName ?? selected.user?.firstName}</p>
                    <p className="text-xs text-gray-500">{selected.shippingAddress?.phone}</p>
                    {selected.user && <p className="text-xs text-gray-500">{selected.user.email}</p>}
                    {selected.shippingAddress && (
                      <p className="text-xs text-gray-400 mt-1">
                        {selected.shippingAddress.addressLine1}, {selected.shippingAddress.city}, {selected.shippingAddress.country}
                      </p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Items</p>
                    <div className="space-y-2">
                      {selected.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {item.productName}
                            <span className="text-gray-400"> — {item.size}{item.colour ? ` / ${item.colour}` : ''} ×{item.quantity}</span>
                          </span>
                          <span className="font-medium ml-3 shrink-0">{formatPrice(item.totalCents)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Subtotal</span><span>{formatPrice(selected.subtotalCents)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Shipping</span><span>{selected.shippingCents === 0 ? 'Free' : formatPrice(selected.shippingCents)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold pt-1">
                        <span>Total</span><span>{formatPrice(selected.totalCents)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tracking */}
                  {(selected.trackingNumber || selected.courierName) && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Tracking</p>
                      {selected.courierName && <p className="text-sm">{selected.courierName}</p>}
                      {selected.trackingNumber && <p className="text-xs font-mono text-gray-500">{selected.trackingNumber}</p>}
                    </div>
                  )}

                  {/* Update status */}
                  {nextStatuses.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Update Status</p>
                      <div className="space-y-3">
                        <div className="flex gap-2 flex-wrap">
                          {nextStatuses.map((s) => (
                            <button
                              key={s}
                              onClick={() => setNewStatus(s === newStatus ? '' : s)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${newStatus === s ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:border-black'}`}
                            >
                              {s.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>

                        {newStatus === 'SHIPPED' && (
                          <div className="grid grid-cols-2 gap-2">
                            <input value={tracking} onChange={(e) => setTracking(e.target.value)}
                              placeholder="Tracking number"
                              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
                            <input value={courier} onChange={(e) => setCourier(e.target.value)}
                              placeholder="Courier name"
                              className="border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black" />
                          </div>
                        )}

                        <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                          placeholder="Note (optional)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-black" />

                        <button
                          onClick={handleUpdateStatus}
                          disabled={!newStatus || updatingStatus}
                          className="w-full bg-black text-white text-xs py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 transition-colors"
                        >
                          {updatingStatus ? 'Updating…' : `Mark as ${newStatus.replace(/_/g, ' ') || '—'}`}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Status history */}
                  {selected.statusHistory?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">History</p>
                      <div className="space-y-2">
                        {[...selected.statusHistory].reverse().map((h) => (
                          <div key={h.id} className="flex items-start gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                            <div>
                              <span className="text-gray-700 font-medium">{h.toStatus.replace(/_/g, ' ')}</span>
                              {h.note && <span className="text-gray-400"> — {h.note}</span>}
                              <p className="text-gray-400">
                                {new Date(h.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                {h.changedBy && ` · ${h.changedBy}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
