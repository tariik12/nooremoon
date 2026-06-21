'use client';

import Image from 'next/image';
import { useState, useRef } from 'react';
import type { Product, Category, SubCategory, ProductImage } from '@/lib/api';
import {
  adminUploadProductImage,
  adminDeleteProductImage,
  adminCreateProduct,
  adminUpdateProduct,
} from '@/lib/api';

interface Tier { id: string; name: string; slug: string }

interface Props {
  token: string;
  categories: Category[];
  subCategories: SubCategory[];
  tiers: Tier[];
  product?: Product;
  onSaved: (p: Product) => void;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  tierId: string;
  basePriceCents: string;
  discountPercent: string;
  isCottocool: boolean;
  isFlashSale: boolean;
  isActive: boolean;
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ProductForm({ token, categories, subCategories, tiers, product, onSaved }: Props) {
  const [form, setForm] = useState<FormData>({
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    description: product?.description ?? '',
    categoryId: product?.category?.id ?? '',
    subCategoryId: product?.subCategory?.id ?? '',
    tierId: product?.tier?.id ?? '',
    basePriceCents: product ? String(product.basePriceCents / 100) : '',
    discountPercent: product ? String(product.discountPercent) : '0',
    isCottocool: product?.isCottocool ?? false,
    isFlashSale: product?.isFlashSale ?? false,
    isActive: (product as any)?.isActive ?? true,
  });

  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // current product id (set after creation for new products)
  const [productId, setProductId] = useState<string | undefined>(product?.id);

  const filteredSubs = subCategories.filter(
    (sc) => !form.categoryId || sc.categoryId === form.categoryId,
  );

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setError('');
    if (!form.name.trim() || !form.slug.trim() || !form.categoryId || !form.basePriceCents) {
      setError('Name, slug, category and price are required.');
      return;
    }
    const basePriceCents = Math.round(parseFloat(form.basePriceCents) * 100);
    if (isNaN(basePriceCents) || basePriceCents <= 0) {
      setError('Invalid price.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        categoryId: form.categoryId,
        subCategoryId: form.subCategoryId || undefined,
        tierId: form.tierId || undefined,
        basePriceCents,
        discountPercent: parseInt(form.discountPercent) || 0,
        isCottocool: form.isCottocool,
        isFlashSale: form.isFlashSale,
        isActive: form.isActive,
      };

      let saved: Product;
      if (productId) {
        saved = await adminUpdateProduct(token, productId, payload);
      } else {
        saved = await adminCreateProduct(token, payload as any);
        setProductId(saved.id);
      }
      onSaved(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !productId) return;
    setUploadingImg(true);
    try {
      const img = await adminUploadProductImage(token, productId, file);
      setImages((prev) => [...prev, img]);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploadingImg(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDeleteImage(imageId: string) {
    if (!productId || !confirm('Remove this image?')) return;
    try {
      await adminDeleteProductImage(token, productId, imageId);
      setImages((prev) => prev.filter((i) => i.id !== imageId));
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Basic Info */}
      <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#6b6b6b] mb-5">Basic Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => {
                set('name', e.target.value);
                if (!product) set('slug', toSlug(e.target.value));
              }}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] transition-colors"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Slug *</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => set('slug', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] transition-colors font-mono"
              placeholder="product-slug"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={4}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] transition-colors resize-none"
              placeholder="Product description…"
            />
          </div>
        </div>
      </section>

      {/* Categorisation */}
      <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#6b6b6b] mb-5">Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Category *</label>
            <select
              value={form.categoryId}
              onChange={(e) => { set('categoryId', e.target.value); set('subCategoryId', ''); }}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] bg-white transition-colors"
            >
              <option value="">— Select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Sub-category</label>
            <select
              value={form.subCategoryId}
              onChange={(e) => set('subCategoryId', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] bg-white transition-colors"
            >
              <option value="">— None —</option>
              {filteredSubs.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Tier</label>
            <select
              value={form.tierId}
              onChange={(e) => set('tierId', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] bg-white transition-colors"
            >
              <option value="">— None —</option>
              {tiers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#6b6b6b] mb-5">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Base Price ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.basePriceCents}
              onChange={(e) => set('basePriceCents', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] transition-colors"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#6b6b6b] mb-1.5">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.discountPercent}
              onChange={(e) => set('discountPercent', e.target.value)}
              className="w-full border border-[#e5e5e5] rounded-sm px-3 py-2.5 text-[13px] focus:outline-none focus:border-[#111] transition-colors"
              placeholder="0"
            />
          </div>
          <div className="flex flex-col justify-end">
            {form.basePriceCents && (
              <p className="text-[12px] text-[#6b6b6b]">
                Final: <span className="text-[#111] font-medium">
                  ${(parseFloat(form.basePriceCents || '0') * (1 - (parseInt(form.discountPercent) || 0) / 100)).toFixed(2)}
                </span>
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          {[
            { key: 'isCottocool' as const, label: 'CottoCool fabric' },
            { key: 'isFlashSale' as const, label: 'Flash sale' },
            { key: 'isActive' as const, label: 'Active (visible on site)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form[key] as boolean}
                onChange={(e) => set(key, e.target.checked)}
                className="w-3.5 h-3.5 accent-[#111]"
              />
              <span className="text-[12px] text-[#6b6b6b]">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Images */}
      <section className="bg-white border border-[#e5e5e5] rounded-sm p-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-widest text-[#6b6b6b] mb-5">Images</h2>

        {!productId && (
          <p className="text-[12px] text-[#e68a00] mb-4">Save the product first before uploading images.</p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative w-24 h-32 rounded-sm overflow-hidden border border-[#e5e5e5] group">
              <Image
                src={img.url.startsWith('/') ? `http://localhost:3001${img.url}` : img.url}
                alt={img.altText ?? ''}
                fill
                className="object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">Primary</span>
              )}
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-1 right-1 bg-white/90 text-[#cc0000] w-5 h-5 rounded-sm text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}

          {productId && (
            <label className={`w-24 h-32 border-2 border-dashed border-[#e5e5e5] rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-[#111] transition-colors ${uploadingImg ? 'opacity-50 pointer-events-none' : ''}`}>
              <span className="text-2xl text-[#ccc]">+</span>
              <span className="text-[10px] text-[#aaa] mt-1">{uploadingImg ? 'Uploading…' : 'Add image'}</span>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}
        </div>
        <p className="text-[11px] text-[#aaa]">First image uploaded becomes primary. JPG / PNG / WebP.</p>
      </section>

      {/* Error + Save */}
      {error && (
        <p className="text-[13px] text-[#cc0000] bg-[#fff5f5] border border-[#fecaca] rounded-sm px-4 py-3">{error}</p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#111] text-white text-[12px] uppercase tracking-widest px-8 py-3 rounded-sm hover:bg-[#333] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : productId ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}
