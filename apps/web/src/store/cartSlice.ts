import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
}

export interface CartVariant {
  id: string;
  size: string;
  colour: string | null;
  sku: string;
  stockQty: number;
}

export interface CartItem {
  id: string;
  quantity: number;
  unitPriceCents: number;
  totalCents: number;
  variant: CartVariant | null;
  product: CartProduct | null;
}

export interface CartState {
  cartId: string | null;
  items: CartItem[];
  subtotalCents: number;
  itemCount: number;
  sessionId: string;
  loading: boolean;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('cart_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

const initialState: CartState = {
  cartId: null,
  items: [],
  subtotalCents: 0,
  itemCount: 0,
  sessionId: '',
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initSession(state) {
      if (!state.sessionId) {
        state.sessionId = getOrCreateSessionId();
      }
    },
    setCart(state, action: PayloadAction<{ cartId: string; items: CartItem[]; subtotalCents: number; itemCount: number }>) {
      state.cartId = action.payload.cartId;
      state.items = action.payload.items;
      state.subtotalCents = action.payload.subtotalCents;
      state.itemCount = action.payload.itemCount;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    clearCart(state) {
      state.items = [];
      state.subtotalCents = 0;
      state.itemCount = 0;
      state.cartId = null;
    },
  },
});

export const { initSession, setCart, setLoading, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
