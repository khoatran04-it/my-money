import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  PagedResult,
  TransactionCreateDto,
  TransactionFilterDto,
  TransactionReadDto,
  TransactionUpdateDto,
} from '@/types/transaction.types';

export const transactionApi = {
  getPaged: (filter?: TransactionFilterDto) =>
    axiosInstance.get<unknown, ApiResponse<PagedResult<TransactionReadDto>>>('/transaction', {
      params: filter,
    }),

  getById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<TransactionReadDto>>(`/transaction/${id}`),

  create: (data: TransactionCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<TransactionReadDto>>('/transaction', data),

  update: (id: string, data: TransactionUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<TransactionReadDto>>(`/transaction/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<boolean>>(`/transaction/${id}`),
};
