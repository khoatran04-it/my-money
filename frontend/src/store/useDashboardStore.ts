import { create } from 'zustand';
import type { DashboardFilterDto, DashboardOverviewDto } from '@/types/dashboard.types';
import { dashboardApi } from '@/api/dashboardApi';

interface DashboardState {
  overview: DashboardOverviewDto | null;
  filter: DashboardFilterDto;
  isLoading: boolean;

  // Actions
  fetchOverview: (customFilter?: Partial<DashboardFilterDto>) => Promise<void>;
  setFilter: (newFilter: Partial<DashboardFilterDto>) => void;
}

const now = new Date();

export const useDashboardStore = create<DashboardState>((set, get) => ({
  overview: null,
  filter: {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  },
  isLoading: false,

  fetchOverview: async (customFilter) => {
    set({ isLoading: true });
    try {
      const current = { ...get().filter, ...customFilter };
      const res = await dashboardApi.getOverview(current);
      if (res.success && res.data) {
        set({
          overview: res.data,
          filter: current,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setFilter: (newFilter) => {
    const updated = { ...get().filter, ...newFilter };
    get().fetchOverview(updated);
  },
}));
