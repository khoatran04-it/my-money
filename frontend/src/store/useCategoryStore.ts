import { create } from 'zustand';
import type {
  CategoryCreateDto,
  CategoryReadDto,
  CategoryUpdateDto,
  TransactionType,
} from '@/types/category.types';
import { categoryApi } from '@/api/categoryApi';

interface CategoryState {
  categories: CategoryReadDto[];
  isLoading: boolean;

  // Actions
  fetchCategories: (type?: TransactionType) => Promise<void>;
  createCategory: (data: CategoryCreateDto) => Promise<void>;
  updateCategory: (id: string, data: CategoryUpdateDto) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async (type?: TransactionType) => {
    set({ isLoading: true });
    try {
      const res = await categoryApi.getAll(type);
      if (res.success && res.data) {
        set({ categories: res.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createCategory: async (data: CategoryCreateDto) => {
    set({ isLoading: true });
    try {
      const res = await categoryApi.create(data);
      if (res.success && res.data) {
        set((state) => ({ categories: [...state.categories, res.data!] }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id: string, data: CategoryUpdateDto) => {
    set({ isLoading: true });
    try {
      const res = await categoryApi.update(id, data);
      if (res.success && res.data) {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? res.data! : c)),
        }));
      }
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id: string) => {
    set({ isLoading: true });
    try {
      await categoryApi.delete(id);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));
