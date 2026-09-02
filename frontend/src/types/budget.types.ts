export interface BudgetReadDto {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentage: number;
  isOverBudget: boolean;
  month: number;
  year: number;
  createdAt: string;
}

export interface BudgetCreateDto {
  categoryId: string;
  limitAmount: number;
  month: number;
  year: number;
}

export interface BudgetUpdateDto {
  limitAmount: number;
}

export interface BudgetSummaryDto {
  totalLimit: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  month: number;
  year: number;
  budgets: BudgetReadDto[];
}
