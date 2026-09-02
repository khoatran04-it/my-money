import { create } from 'zustand';
import type { WalletCreateDto, WalletReadDto, WalletUpdateDto } from '@/types/wallet.types';
import { walletApi } from '@/api/walletApi';

interface WalletState {
  wallets: WalletReadDto[];
  isLoading: boolean;

  // Computed
  defaultWallet: WalletReadDto | null;
  totalBalance: number;

  // Actions
  fetchWallets: () => Promise<void>;
  createWallet: (data: WalletCreateDto) => Promise<void>;
  updateWallet: (id: string, data: WalletUpdateDto) => Promise<void>;
  deleteWallet: (id: string) => Promise<void>;
  setDefaultWallet: (id: string) => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  isLoading: false,

  get defaultWallet() {
    return get().wallets.find((w) => w.isDefault) ?? null;
  },

  get totalBalance() {
    return get().wallets.reduce((sum, w) => sum + w.balance, 0);
  },

  fetchWallets: async () => {
    set({ isLoading: true });
    try {
      const res = await walletApi.getAll();
      if (res.success && res.data) {
        set({ wallets: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createWallet: async (data) => {
    set({ isLoading: true });
    try {
      const res = await walletApi.create(data);
      if (res.success && res.data) {
        // Nếu ví mới là default, cập nhật lại toàn bộ list để đồng bộ cờ isDefault
        if (res.data.isDefault) {
          await get().fetchWallets();
        } else {
          set((state) => ({ wallets: [...state.wallets, res.data!] }));
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateWallet: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await walletApi.update(id, data);
      if (res.success && res.data) {
        set((state) => ({
          wallets: state.wallets.map((w) => (w.id === id ? res.data! : w)),
        }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteWallet: async (id) => {
    set({ isLoading: true });
    try {
      await walletApi.delete(id);
      // Fetch lại để đồng bộ isDefault nếu xóa ví default
      await get().fetchWallets();
    } finally {
      set({ isLoading: false });
    }
  },

  setDefaultWallet: async (id) => {
    set({ isLoading: true });
    try {
      await walletApi.setDefault(id);
      // Fetch lại để cập nhật cờ isDefault trên toàn bộ list
      await get().fetchWallets();
    } finally {
      set({ isLoading: false });
    }
  },
}));
