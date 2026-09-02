import { create } from 'zustand';
import type {
  SavingGoalCreateDto,
  SavingGoalDepositDto,
  SavingGoalSummaryDto,
  SavingGoalUpdateDto,
  SavingGoalWithdrawDto,
} from '@/types/saving.types';
import { savingApi } from '@/api/savingApi';
import { useWalletStore } from './useWalletStore';

interface SavingState {
  summary: SavingGoalSummaryDto | null;
  isLoading: boolean;

  // Actions
  fetchSummary: () => Promise<void>;
  createSavingGoal: (data: SavingGoalCreateDto) => Promise<void>;
  updateSavingGoal: (id: string, data: SavingGoalUpdateDto) => Promise<void>;
  deleteSavingGoal: (id: string) => Promise<void>;
  deposit: (id: string, data: SavingGoalDepositDto) => Promise<void>;
  withdraw: (id: string, data: SavingGoalWithdrawDto) => Promise<void>;
}

export const useSavingStore = create<SavingState>((set, get) => ({
  summary: null,
  isLoading: false,

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const res = await savingApi.getSummary();
      if (res.success && res.data) {
        set({ summary: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createSavingGoal: async (data) => {
    set({ isLoading: true });
    try {
      const res = await savingApi.create(data);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchSummary();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateSavingGoal: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await savingApi.update(id, data);
      if (res.success) {
        await get().fetchSummary();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSavingGoal: async (id) => {
    set({ isLoading: true });
    try {
      const res = await savingApi.delete(id);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchSummary();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deposit: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await savingApi.deposit(id, data);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchSummary();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  withdraw: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await savingApi.withdraw(id, data);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchSummary();
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
