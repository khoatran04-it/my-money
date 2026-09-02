import { create } from 'zustand';
import type {
  TransactionCreateDto,
  TransactionFilterDto,
  TransactionReadDto,
  TransactionUpdateDto,
} from '@/types/transaction.types';
import { transactionApi } from '@/api/transactionApi';
import { useWalletStore } from './useWalletStore';

interface TransactionState {
  transactions: TransactionReadDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  filter: TransactionFilterDto;
  isLoading: boolean;

  // Actions
  fetchTransactions: (customFilter?: Partial<TransactionFilterDto>) => Promise<void>;
  createTransaction: (data: TransactionCreateDto) => Promise<void>;
  updateTransaction: (id: string, data: TransactionUpdateDto) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilter: (newFilter: Partial<TransactionFilterDto>) => void;
  setPage: (page: number) => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
  filter: {
    pageNumber: 1,
    pageSize: 20,
  },
  isLoading: false,

  fetchTransactions: async (customFilter) => {
    set({ isLoading: true });
    try {
      const currentFilter = { ...get().filter, ...customFilter };
      const res = await transactionApi.getPaged(currentFilter);
      if (res.success && res.data) {
        set({
          transactions: res.data.items,
          totalCount: res.data.totalCount,
          pageNumber: res.data.pageNumber,
          pageSize: res.data.pageSize,
          totalPages: res.data.totalPages,
          filter: currentFilter,
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createTransaction: async (data) => {
    set({ isLoading: true });
    try {
      const res = await transactionApi.create(data);
      if (res.success) {
        // Tự động làm mới danh sách ví để cập nhật số dư mới nhất
        useWalletStore.getState().fetchWallets();
        // Tải lại danh sách giao dịch
        await get().fetchTransactions();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await transactionApi.update(id, data);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchTransactions();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      const res = await transactionApi.delete(id);
      if (res.success) {
        useWalletStore.getState().fetchWallets();
        await get().fetchTransactions();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setFilter: (newFilter) => {
    const updated = { ...get().filter, ...newFilter, pageNumber: 1 };
    get().fetchTransactions(updated);
  },

  setPage: (page) => {
    get().fetchTransactions({ pageNumber: page });
  },
}));
