import { create } from 'zustand';
import type { UserReadDto, UserLoginDto, UserCreateDto } from '../types/auth.types';
import { authApi } from '@/api/authApi';
import { userApi } from '@/api/userApi';

interface AuthState {
  user: UserReadDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (data: UserLoginDto) => Promise<void>;
  register: (data: UserCreateDto) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(data);
      if (res.success && res.data) {
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      await authApi.register(data);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const res = await userApi.getProfile();
      if (res.success && res.data) {
        set({ user: res.data, isAuthenticated: true });
      }
    } catch {
      get().logout();
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await get().fetchProfile();
    }
  },
}));