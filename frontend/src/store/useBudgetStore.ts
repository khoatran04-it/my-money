import { create } from 'zustand';
import type {
  BudgetCreateDto,
  BudgetSummaryDto,
  BudgetUpdateDto,
} from '@/types/budget.types';
import { budgetApi } from '@/api/budgetApi';

interface BudgetState {
  summary: BudgetSummaryDto | null;
  month: number;
  year: number;
  isLoading: boolean;

  // Actions
  fetchSummary: (month?: number, year?: number) => Promise<void>;
  createBudget: (data: BudgetCreateDto) => Promise<void>;
  updateBudget: (id: string, data: BudgetUpdateDto) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  setMonthYear: (month: number, year: number) => void;
}

const currentDate = new Date();

export const useBudgetStore = create<BudgetState>((set, get) => ({
  summary: null,
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  isLoading: false,

  fetchSummary: async (m, y) => {
    set({ isLoading: true });
    try {
      const targetMonth = m ?? get().month;
      const targetYear = y ?? get().year;
      const res = await budgetApi.getSummary(targetMonth, targetYear);
      if (res.success && res.data) {
        set({
          summary: res.data,
          month: targetMonth,
          year: targetYear,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createBudget: async (data) => {
    set({ isLoading: true });
    try {
      const res = await budgetApi.create(data);
      if (res.success) {
        await get().fetchSummary(get().month, get().year);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateBudget: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await budgetApi.update(id, data);
      if (res.success) {
        await get().fetchSummary(get().month, get().year);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true });
    try {
      const res = await budgetApi.delete(id);
      if (res.success) {
        await get().fetchSummary(get().month, get().year);
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setMonthYear: (month, year) => {
    set({ month, year });
    get().fetchSummary(month, year);
  },
}));
