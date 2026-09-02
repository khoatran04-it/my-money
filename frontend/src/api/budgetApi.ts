import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  BudgetCreateDto,
  BudgetReadDto,
  BudgetSummaryDto,
  BudgetUpdateDto,
} from '@/types/budget.types';

export const budgetApi = {
  getSummary: (month?: number, year?: number) =>
    axiosInstance.get<unknown, ApiResponse<BudgetSummaryDto>>('/budget', {
      params: { month, year },
    }),

  getById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<BudgetReadDto>>(`/budget/${id}`),

  create: (data: BudgetCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<BudgetReadDto>>('/budget', data),

  update: (id: string, data: BudgetUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<BudgetReadDto>>(`/budget/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<boolean>>(`/budget/${id}`),
};
