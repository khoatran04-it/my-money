export interface SavingGoalReadDto {
  id: string;
  userId: string;
  walletId: string;
  walletName?: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  isCompleted: boolean;
  targetDate?: string;
  color?: string;
  icon?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface SavingGoalCreateDto {
  walletId: string;
  name: string;
  targetAmount: number;
  initialDeposit?: number;
  targetDate?: string;
  color?: string;
  icon?: string;
}

export interface SavingGoalUpdateDto {
  name: string;
  targetAmount: number;
  targetDate?: string;
  color?: string;
  icon?: string;
}

export interface SavingGoalDepositDto {
  amount: number;
}

export interface SavingGoalWithdrawDto {
  amount: number;
}

export interface SavingGoalSummaryDto {
  totalTarget: number;
  totalSaved: number;
  totalRemaining: number;
  overallPercentage: number;
  activeGoalsCount: number;
  completedGoalsCount: number;
  goals: SavingGoalReadDto[];
}
