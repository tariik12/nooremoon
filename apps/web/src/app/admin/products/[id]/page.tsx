'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import {
  adminFetchCategories, adminFetchSubCategories, adminFetchTiers, fetchProduct,
} from '@/lib/api';
import type { Category, SubCategory, Product } from '@/lib/api';
import ProductForm from '../_components/ProductForm';

interface Tier { id: string; name: string; slug: string }

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justSaved = searchParams.get('saved') === '1';
  const token = useSelector((s: RootState) => s.auth.accessToken);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedBanner, setSavedBanner] = useState(justSaved);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      adminFetchCategories(token),
      adminFetchSubCategories(token),
      adminFetchTiers(token),
    ]).then(([cats, subs, ts]) => {
      setCategories(cats);
      setSubCategories(subs);
      setTiers(ts);
    });
  }, [token]);

  useEffect(() => {
    // Load product by id — use admin endpoint via direct fetch
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/admin/products?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(async () => {
      // Fetch individual product — use public slug-less endpoint via id trick
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1'}/admin/products/${id}`,
        { cache: 'no-store', headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        setProduct(await res.json());
      }
    }).finally(() => setLoading(false));
  }, [token, id]);

  function handleSaved(p: Product) {
    setProduct(p);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  }

  if (!token) return null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-[12px] text-[#6b6b6b] hover:text-[#111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#e5e5e5]">/</span>
        <h1 className="text-[18px] font-semibold text-[#111]">
          {product ? product.name : 'Edit Product'}
        </h1>
      </div>

      {savedBanner && (
        <div className="mb-5 bg-[#e8f5e9] border border-[#a5d6a7] text-[#1a5c4a] text-[13px] px-4 py-3 rounded-sm">
          ✓ Product saved successfully.
        </div>
      )}

      {loading ? (
        <p className="text-[13px] text-[#6b6b6b]">Loading…</p>
      ) : !product ? (
        <p className="text-[13px] text-[#cc0000]">Product not found.</p>
      ) : (
        <ProductForm
          token={token}
          categories={categories}
          subCategories={subCategories}
          tiers={tiers}
          product={product}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
