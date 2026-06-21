'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { adminFetchProducts, adminDeleteProduct, formatPrice } from '@/lib/api';
import type { Product } from '@/lib/api';

type AdminProduct = Product & { isActive: boolean; deletedAt: string | null };

export default function AdminProductsPage() {
  const token = useSelector((s: RootState) => s.auth.accessToken);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminFetchProducts(token, { page, limit });
      setProducts(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, name: string) {
    if (!token) return;
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await adminDeleteProduct(token, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setTotal((t) => t - 1);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  const pages = Math.ceil(total / limit);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-[#111]">Products</h1>
          <p className="text-[13px] text-[#6b6b6b]">{total} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#111] text-white text-[12px] uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-[#333] transition-colors"
        >
          + New Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e5e5e5] rounded-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[13px] text-[#6b6b6b]">Loading…</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center text-[13px] text-[#6b6b6b]">
            No products yet.{' '}
            <Link href="/admin/products/new" className="underline text-[#111]">Add one</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                <th className="text-left text-[10px] uppercase tracking-widest text-[#6b6b6b] px-4 py-3 font-normal">Product</th>
                <th className="text-left text-[10px] uppercase tracking-widest text-[#6b6b6b] px-4 py-3 font-normal hidden md:table-cell">Category</th>
                <th className="text-left text-[10px] uppercase tracking-widest text-[#6b6b6b] px-4 py-3 font-normal">Price</th>
                <th className="text-left text-[10px] uppercase tracking-widest text-[#6b6b6b] px-4 py-3 font-normal hidden sm:table-cell">Stock</th>
                <th className="text-left text-[10px] uppercase tracking-widest text-[#6b6b6b] px-4 py-3 font-normal hidden sm:table-cell">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images.find(i => i.isPrimary) ?? p.images[0];
                return (
                  <tr key={p.id} className="border-b border-[#f0f0f0] hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-[#f0f0f0] rounded-sm overflow-hidden shrink-0 relative">
                          {img ? (
                            <Image src={img.url.startsWith('/') ? `http://localhost:3001${img.url}` : img.url} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#e5e5e5]" />
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] text-[#111] font-medium leading-tight">{p.name}</p>
                          <p className="text-[11px] text-[#aaa] mt-0.5">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-[12px] text-[#6b6b6b]">{p.category?.name ?? '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        {p.discountPercent > 0 ? (
                          <>
                            <p className="text-[12px] text-[#cc0000] font-medium">{formatPrice(p.finalPriceCents)}</p>
                            <p className="text-[10px] text-[#aaa] line-through">{formatPrice(p.basePriceCents)}</p>
                          </>
                        ) : (
                          <p className="text-[12px] text-[#111]">{formatPrice(p.basePriceCents)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[11px] font-medium ${p.stockTotal === 0 ? 'text-[#cc0000]' : p.stockTotal < 5 ? 'text-[#e68a00]' : 'text-[#1a5c4a]'}`}>
                        {p.stockTotal === 0 ? 'Out of stock' : `${p.stockTotal} units`}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-sm font-medium ${p.isActive ? 'bg-[#e8f5e9] text-[#1a5c4a]' : 'bg-[#f5f5f5] text-[#999]'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 justify-end">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-[12px] text-[#6b6b6b] hover:text-[#111] transition-colors underline underline-offset-2"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deleting === p.id}
                          className="text-[12px] text-[#cc0000] hover:text-[#990000] transition-colors disabled:opacity-50"
                        >
                          {deleting === p.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-[12px] px-3 py-1.5 border border-[#e5e5e5] rounded-sm hover:bg-[#f7f7f7] disabled:opacity-40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-[12px] text-[#6b6b6b]">Page {page} / {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="text-[12px] px-3 py-1.5 border border-[#e5e5e5] rounded-sm hover:bg-[#f7f7f7] disabled:opacity-40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
