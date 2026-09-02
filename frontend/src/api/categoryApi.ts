import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  CategoryCreateDto,
  CategoryReadDto,
  CategoryUpdateDto,
  TransactionType,
} from '@/types/category.types';

export const categoryApi = {
  getAll: (type?: TransactionType) =>
    axiosInstance.get<unknown, ApiResponse<CategoryReadDto[]>>('/category', {
      params: type ? { type } : undefined,
    }),

  getById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<CategoryReadDto>>(`/category/${id}`),

  create: (data: CategoryCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<CategoryReadDto>>('/category', data),

  update: (id: string, data: CategoryUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<CategoryReadDto>>(`/category/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<boolean>>(`/category/${id}`),
};
