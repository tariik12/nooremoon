'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  adminFetchPromotions,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
  formatPrice,
  type Promotion,
} from '@/lib/api';

const emptyForm = {
  name: '',
  code: '',
  type: 'percent' as 'percent' | 'fixed',
  discountPercent: '',
  discountCents: '',
  minOrderCents: '',
  maxUses: '',
  isFlashSale: false,
  isActive: true,
  startsAt: '',
  endsAt: '',
};

type FormState = typeof emptyForm;

export default function AdminPromotionsPage() {
  const token = useSelector((s: RootState) => s.auth.accessToken);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState<FormState>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const load = useCallback(
    async (p: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await adminFetchPromotions(token, p, limit);
        setPromotions(res.data);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  }

  function openEdit(promo: Promotion) {
    setEditing(promo);
    setForm({
      name: promo.name,
      code: promo.code ?? '',
      type: (promo.type as 'percent' | 'fixed'),
      discountPercent: promo.discountPercent != null ? String(promo.discountPercent) : '',
      discountCents: promo.discountCents != null ? String(promo.discountCents / 100) : '',
      minOrderCents: promo.minOrderCents != null ? String(promo.minOrderCents / 100) : '',
      maxUses: promo.maxUses != null ? String(promo.maxUses) : '',
      isFlashSale: promo.isFlashSale,
      isActive: promo.isActive,
      startsAt: promo.startsAt ? promo.startsAt.slice(0, 16) : '',
      endsAt: promo.endsAt ? promo.endsAt.slice(0, 16) : '',
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!token || !form.name.trim()) return;
    setSaving(true);
    try {
      const payload: Partial<Promotion> = {
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        type: form.type,
        isFlashSale: form.isFlashSale,
        isActive: form.isActive,
        discountPercent: form.type === 'percent' && form.discountPercent ? Number(form.discountPercent) : undefined,
        discountCents: form.type === 'fixed' && form.discountCents ? Math.round(Number(form.discountCents) * 100) : undefined,
        minOrderCents: form.minOrderCents ? Math.round(Number(form.minOrderCents) * 100) : undefined,
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        startsAt: form.startsAt || undefined,
        endsAt: form.endsAt || undefined,
      } as any;

      if (editing) {
        await adminUpdatePromotion(token, editing.id, payload);
      } else {
        await adminCreatePromotion(token, payload);
      }
      setShowForm(false);
      load(page);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token || !confirm('Delete this promotion?')) return;
    setDeleting(id);
    try {
      await adminDeletePromotion(token, id);
      load(page);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Promotions & Offers</h1>
        <button
          onClick={openCreate}
          className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          + New Promotion
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-5">
              {editing ? 'Edit Promotion' : 'New Promotion'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Summer Sale 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Promo Code</label>
                <input
                  value={form.code}
                  onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="SUMMER20 (leave blank for automatic)"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percent' | 'fixed' }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>

              {form.type === 'percent' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount %</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.discountPercent}
                    onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="20"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Discount Amount (৳)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.discountCents}
                    onChange={(e) => setForm((f) => ({ ...f, discountCents: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Order (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={form.minOrderCents}
                  onChange={(e) => setForm((f) => ({ ...f, minOrderCents: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Leave blank for no minimum"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Leave blank for unlimited"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Starts At</label>
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Ends At</label>
                  <input
                    type="datetime-local"
                    value={form.endsAt}
                    onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFlashSale}
                    onChange={(e) => setForm((f) => ({ ...f, isFlashSale: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  Flash Sale
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="bg-black text-white px-5 py-2 text-sm rounded hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading…</div>
      ) : promotions.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-gray-400 text-sm">No promotions yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <th className="text-left px-5 py-3">Name</th>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Discount</th>
                <th className="text-left px-4 py-3">Uses</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <div className="font-medium">{promo.name}</div>
                    {promo.isFlashSale && (
                      <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase">
                        Flash
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {promo.code ?? <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {promo.type === 'percent'
                      ? `${promo.discountPercent}%`
                      : formatPrice(promo.discountCents ?? 0)}
                    {promo.minOrderCents ? (
                      <span className="text-gray-400 text-xs ml-1">
                        (min {formatPrice(promo.minOrderCents)})
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {promo.usedCount}
                    {promo.maxUses ? ` / ${promo.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {promo.endsAt
                      ? new Date(promo.endsAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(promo)}
                        className="text-xs text-gray-500 hover:text-black underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        disabled={deleting === promo.id}
                        className="text-xs text-red-400 hover:text-red-600 underline disabled:opacity-50"
                      >
                        {deleting === promo.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > limit && (
        <div className="flex justify-center gap-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-500">
            Page {page} of {Math.ceil(total / limit)}
          </span>
          <button
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
