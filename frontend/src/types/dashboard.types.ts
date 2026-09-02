import type { BudgetReadDto } from './budget.types';
import type { SavingGoalReadDto } from './saving.types';
import type { TransactionReadDto } from './transaction.types';

export interface DashboardFilterDto {
  month?: number;
  year?: number;
  walletId?: string;
}

export interface MonthlyTrendDto {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownDto {
  categoryId: string;
  categoryName: string;
  color?: string;
  icon?: string;
  amount: number;
  percentage: number;
}

export interface WalletDistributionDto {
  walletId: string;
  walletName: string;
  type: string;
  color?: string;
  balance: number;
  availableBalance: number;
  percentage: number;
}

export interface DashboardOverviewDto {
  totalBalance: number;
  totalAvailableBalance: number;
  totalSavings: number;
  month: number;
  year: number;
  monthlyIncome: number;
  monthlyExpense: number;
  netCashflow: number;
  savingsRate: number;
  monthlyTrends: MonthlyTrendDto[];
  expenseBreakdown: CategoryBreakdownDto[];
  incomeBreakdown: CategoryBreakdownDto[];
  walletDistribution: WalletDistributionDto[];
  budgetAlerts: BudgetReadDto[];
  savingGoals: SavingGoalReadDto[];
  recentTransactions: TransactionReadDto[];
}
