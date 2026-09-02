export type TransactionType = 'Income' | 'Expense';

export interface CategoryReadDto {
  id: string;
  userId?: string | null;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CategoryCreateDto {
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
}

export interface CategoryUpdateDto {
  name?: string;
  icon?: string;
  color?: string;
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  Income: 'Thu nhập',
  Expense: 'Chi tiêu',
};
