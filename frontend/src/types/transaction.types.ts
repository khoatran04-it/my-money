import type { TransactionType } from './category.types';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface TransactionReadDto {
  id: string;
  userId: string;
  walletId: string;
  walletName?: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
  createdAt: string;
}

export interface TransactionCreateDto {
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
}

export interface TransactionUpdateDto {
  walletId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
}

export interface TransactionFilterDto {
  walletId?: string;
  categoryId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}
