const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export async function fetchSettings(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API}/settings/public`, { next: { revalidate: 600 } });
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, string> = {};
    (Array.isArray(data) ? data : []).forEach((s: { key: string; value: string }) => {
      map[s.key] = s.value;
    });
    return map;
  } catch {
    return {};
  }
}

export async function fetchNav(): Promise<NavItem[]> {
  try {
    const res = await fetch(`${API}/nav`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchBanners(pageType: string): Promise<Banner[]> {
  try {
    const res = await fetch(`${API}/banners/${pageType}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export interface ProductsParams {
  categoryId?: string;
  subCategoryId?: string;
  tierId?: string;
  isCottocool?: boolean;
  isFlashSale?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export async function fetchProducts(params?: ProductsParams): Promise<ProductList> {
  const rawParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) rawParams[k] = String(v);
    });
  }
  const qs = Object.keys(rawParams).length ? '?' + new URLSearchParams(rawParams).toString() : '';
  try {
    const res = await fetch(`${API}/products${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return { data: [], total: 0, page: 1, limit: 20 };
    return res.json();
  } catch {
    return { data: [], total: 0, page: 1, limit: 20 };
  }
}

export async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchSubCategories(categoryId?: string): Promise<SubCategory[]> {
  const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
  try {
    const res = await fetch(`${API}/sub-categories${qs}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchSubCategory(slug: string): Promise<SubCategory | null> {
  try {
    const res = await fetch(`${API}/sub-categories/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Types ──────────────────────────────────────────────────────────────────
export interface NavItem {
  id: string;
  label: string;
  url: string | null;
  type: string;
  children: NavItem[];
  sortOrder: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  pageType: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  heroImageUrl: string | null;
  navImageUrl: string | null;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  heroImageUrl: string | null;
  categoryId: string;
  sortOrder: number;
  category: Category;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  careInstructions: string | null;
  basePriceCents: number;
  discountPercent: number;
  finalPriceCents: number;
  stockTotal: number;
  isCottocool: boolean;
  isFlashSale: boolean;
  category: Category | null;
  subCategory: { id: string; name: string; slug: string } | null;
  tier: { id: string; name: string; slug: string } | null;
  images: ProductImage[];
  variants: ProductVariant[];
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  colour: string | null;
  sku: string;
  stockQty: number;
}

export interface ProductList {
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export function formatPrice(cents: number): string {
  const taka = Math.round(cents / 100);
  return `৳${taka.toLocaleString('en-US')}`;
}

// ── Cart API ────────────────────────────────────────────────────────────────

function cartHeaders(sessionId: string): Record<string, string> {
  return { 'Content-Type': 'application/json', 'x-session-id': sessionId };
}

export async function apiAddToCart(
  variantId: string,
  quantity: number,
  sessionId: string,
): Promise<CartResponse> {
  const res = await fetch(`${API}/cart/items`, {
    method: 'POST',
    headers: cartHeaders(sessionId),
    body: JSON.stringify({ productVariantId: variantId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? 'Failed to add to cart');
  }
  return res.json();
}

export async function apiUpdateCartItem(
  itemId: string,
  quantity: number,
  sessionId: string,
): Promise<CartResponse> {
  const res = await fetch(`${API}/cart/items/${itemId}`, {
    method: 'PATCH',
    headers: cartHeaders(sessionId),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error('Failed to update cart');
  return res.json();
}

export async function apiRemoveCartItem(
  itemId: string,
  sessionId: string,
): Promise<CartResponse> {
  const res = await fetch(`${API}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: cartHeaders(sessionId),
  });
  if (!res.ok) throw new Error('Failed to remove item');
  return res.json();
}

export interface CartResponse {
  cartId: string;
  items: import('@/store/cartSlice').CartItem[];
  subtotalCents: number;
  itemCount: number;
}

// ── Admin API ───────────────────────────────────────────────────────────────

export async function adminFetchProducts(
  token: string,
  params?: { page?: number; limit?: number; search?: string },
): Promise<ProductList & { data: (Product & { isActive: boolean; deletedAt: string | null })[] }> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  const res = await fetch(`${API}/admin/products?${qs}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load products');
  return res.json();
}

export async function adminCreateProduct(
  token: string,
  data: Partial<Product> & { basePriceCents: number; name: string; slug: string; categoryId: string },
): Promise<Product> {
  const res = await fetch(`${API}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? 'Failed to create product');
  }
  return res.json();
}

export async function adminUpdateProduct(
  token: string,
  id: string,
  data: Partial<Product>,
): Promise<Product> {
  const res = await fetch(`${API}/admin/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function adminDeleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
}

export async function adminUploadProductImage(
  token: string,
  productId: string,
  file: File,
): Promise<ProductImage> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API}/admin/products/${productId}/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  return res.json();
}

export async function adminDeleteProductImage(
  token: string,
  productId: string,
  imageId: string,
): Promise<void> {
  const res = await fetch(`${API}/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete image');
}

export async function adminFetchCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API}/categories`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function adminFetchSubCategories(token: string): Promise<SubCategory[]> {
  const res = await fetch(`${API}/sub-categories`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function adminFetchTiers(token: string): Promise<{ id: string; name: string; slug: string }[]> {
  const res = await fetch(`${API}/tiers`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

// ── Profile / Orders ───────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  productName: string;
  size: string;
  colour: string | null;
  sku: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  currency: string;
  ivrStatus: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    country: string;
  } | null;
}

export interface OrdersPage {
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export async function fetchMyOrders(token: string, page = 1, limit = 10): Promise<OrdersPage> {
  const res = await fetch(`${API}/orders/my?page=${page}&limit=${limit}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { data: [], total: 0, page: 1, limit };
  return res.json();
}

// ── Wishlist ───────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product & { images: ProductImage[]; variants: ProductVariant[] };
}

export async function fetchWishlist(token: string): Promise<WishlistItem[]> {
  const res = await fetch(`${API}/users/wishlist`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function addToWishlist(token: string, productId: string): Promise<void> {
  await fetch(`${API}/users/wishlist/${productId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFromWishlist(token: string, productId: string): Promise<void> {
  await fetch(`${API}/users/wishlist/${productId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Promotions ─────────────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  name: string;
  code: string | null;
  type: string;
  discountPercent: number | null;
  discountCents: number | null;
  minOrderCents: number | null;
  maxUses: number | null;
  usedCount: number;
  isFlashSale: boolean;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export async function fetchActivePromotions(): Promise<Promotion[]> {
  try {
    const res = await fetch(`${API}/promotions/active`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function adminFetchPromotions(
  token: string,
  page = 1,
  limit = 20,
): Promise<{ data: Promotion[]; total: number; page: number; limit: number }> {
  const res = await fetch(`${API}/admin/promotions?page=${page}&limit=${limit}`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { data: [], total: 0, page: 1, limit };
  return res.json();
}

export async function adminCreatePromotion(
  token: string,
  data: Partial<Promotion>,
): Promise<Promotion> {
  const res = await fetch(`${API}/admin/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create promotion');
  return res.json();
}

export async function adminUpdatePromotion(
  token: string,
  id: string,
  data: Partial<Promotion>,
): Promise<Promotion> {
  const res = await fetch(`${API}/admin/promotions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update promotion');
  return res.json();
}

export async function adminDeletePromotion(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/admin/promotions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete promotion');
}

export async function fetchUserProfile(token: string) {
  const res = await fetch(`${API}/users/profile`, {
    cache: 'no-store',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}
