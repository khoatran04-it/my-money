import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { UserReadDto, UserUpdateDto, UserChangePasswordDto } from '../types/auth.types';

export const userApi = {
  getProfile: () =>
    axiosInstance.get<unknown, ApiResponse<UserReadDto>>('/user/profile'),

  updateProfile: (data: UserUpdateDto) =>
    axiosInstance.put<unknown, ApiResponse<UserReadDto>>('/user/profile', data),

  changePassword: (data: UserChangePasswordDto) =>
    axiosInstance.put<unknown, ApiResponse<boolean>>('/user/change-password', data),
};