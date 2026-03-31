import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  loadToken: async () => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      set({ token });
      try {
        const { data } = await api.get('/auth/me');
        set({ user: data, loading: false });
      } catch {
        await AsyncStorage.removeItem('token');
        set({ token: null, loading: false });
      }
    } else {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },

  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    await AsyncStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    const { data } = await api.get('/auth/me');
    set({ user: data });
  },
}));
