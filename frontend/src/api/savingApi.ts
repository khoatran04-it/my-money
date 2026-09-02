import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type {
  SavingGoalCreateDto,
  SavingGoalDepositDto,
  SavingGoalReadDto,
  SavingGoalSummaryDto,
  SavingGoalUpdateDto,
  SavingGoalWithdrawDto,
} from '@/types/saving.types';

export const savingApi = {
  getSummary: () =>
    axiosInstance.get<unknown, ApiResponse<SavingGoalSummaryDto>>('/savinggoal'),

  getById: (id: string) =>
    axiosInstance.get<unknown, ApiResponse<SavingGoalReadDto>>(`/savinggoal/${id}`),

  create: (data: SavingGoalCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<SavingGoalReadDto>>('/savinggoal', data),

  update: (id: string, data: SavingGoalUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<SavingGoalReadDto>>(`/savinggoal/${id}`, data),

  delete: (id: string) =>
    axiosInstance.delete<unknown, ApiResponse<boolean>>(`/savinggoal/${id}`),

  deposit: (id: string, data: SavingGoalDepositDto) =>
    axiosInstance.post<unknown, ApiResponse<SavingGoalReadDto>>(`/savinggoal/${id}/deposit`, data),

  withdraw: (id: string, data: SavingGoalWithdrawDto) =>
    axiosInstance.post<unknown, ApiResponse<SavingGoalReadDto>>(`/savinggoal/${id}/withdraw`, data),
};
