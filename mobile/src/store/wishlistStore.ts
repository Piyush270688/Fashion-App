import { create } from 'zustand';
import api from '../api/client';

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  price: number;
  image_url: string;
  rating: number;
  category_name: string;
  created_at: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/wishlist');
      set({ items: data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addToWishlist: async (productId) => {
    await api.post('/wishlist', { product_id: productId });
    const { data } = await api.get('/wishlist');
    set({ items: data });
  },

  removeFromWishlist: async (productId) => {
    await api.delete(`/wishlist/${productId}`);
    set({ items: get().items.filter((i) => i.product_id !== productId) });
  },

  isInWishlist: (productId) => {
    return get().items.some((i) => i.product_id === productId);
  },
}));
