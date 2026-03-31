import { create } from 'zustand';
import api from '../api/client';

interface CartItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  size: string;
  category_name: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, size: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  loading: false,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items, total: data.total, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToCart: async (productId, size, quantity = 1) => {
    await api.post('/cart', { product_id: productId, size, quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total });
  },

  updateQuantity: async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity });
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total });
  },

  removeItem: async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`);
    const { data } = await api.get('/cart');
    set({ items: data.items, total: data.total });
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], total: 0 });
  },
}));
