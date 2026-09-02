import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { WalletCreateDto, WalletReadDto, WalletUpdateDto } from '@/types/wallet.types';

export const walletApi = {
  getAll: () =>
    axiosInstance.get<unknown, ApiResponse<WalletReadDto[]>>('/wallet'),

  getById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<WalletReadDto>>(`/wallet/${id}`),

  create: (data: WalletCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<WalletReadDto>>('/wallet', data),

  update: (id: string, data: WalletUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<WalletReadDto>>(`/wallet/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<boolean>>(`/wallet/${id}`),

  setDefault: (id: string) =>
    axiosInstance.put<unknown, ApiResponse<WalletReadDto>>(`/wallet/${id}/set-default`),
};
