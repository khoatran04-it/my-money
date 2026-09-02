import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types/api';
import type { UserCreateDto, UserLoginDto, UserLoginResponseDto, UserReadDto } from '@/types/auth.types';

export const authApi = {
  register: (data: UserCreateDto) =>
    axiosInstance.post<unknown, ApiResponse<UserReadDto>>('/auth/register', data),

  login: (data: UserLoginDto) =>
    axiosInstance.post<unknown, ApiResponse<UserLoginResponseDto>>('/auth/login', data),
};