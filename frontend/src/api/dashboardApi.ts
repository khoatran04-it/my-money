import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { DashboardFilterDto, DashboardOverviewDto } from '@/types/dashboard.types';

export const dashboardApi = {
  getOverview: (filter?: DashboardFilterDto) =>
    axiosInstance.get<unknown, ApiResponse<DashboardOverviewDto>>('/dashboard/overview', {
      params: filter,
    }),
};
