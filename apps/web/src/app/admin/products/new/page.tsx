'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { adminFetchCategories, adminFetchSubCategories, adminFetchTiers } from '@/lib/api';
import type { Category, SubCategory, Product } from '@/lib/api';
import ProductForm from '../_components/ProductForm';

interface Tier { id: string; name: string; slug: string }

export default function NewProductPage() {
  const router = useRouter();
  const token = useSelector((s: RootState) => s.auth.accessToken);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);

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
    }).finally(() => setLoading(false));
  }, [token]);

  function handleSaved(p: Product) {
    router.push(`/admin/products/${p.id}?saved=1`);
  }

  if (!token) return null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-[12px] text-[#6b6b6b] hover:text-[#111] transition-colors">
          ← Products
        </Link>
        <span className="text-[#e5e5e5]">/</span>
        <h1 className="text-[18px] font-semibold text-[#111]">New Product</h1>
      </div>

      {loading ? (
        <p className="text-[13px] text-[#6b6b6b]">Loading…</p>
      ) : (
        <ProductForm
          token={token}
          categories={categories}
          subCategories={subCategories}
          tiers={tiers}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
