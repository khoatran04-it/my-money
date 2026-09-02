import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  PiggyBank,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  Wallet,
  Coins,
  Laptop,
  Car,
  Plane,
  Home,
  GraduationCap,
  Heart,
  Gift,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { useSavingStore } from '@/store/useSavingStore';
import { useWalletStore } from '@/store/useWalletStore';
import type {
  SavingGoalCreateDto,
  SavingGoalReadDto,
} from '@/types/saving.types';

// ============================================================
// Helpers & Icons
// ============================================================
const GOAL_ICONS: Record<string, LucideIcon> = {
  piggy: PiggyBank,
  laptop: Laptop,
  car: Car,
  plane: Plane,
  home: Home,
  graduation: GraduationCap,
  heart: Heart,
  gift: Gift,
  phone: Smartphone,
  coins: Coins,
};

const GOAL_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#64748B',
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ============================================================
// Schemas
// ============================================================
const createGoalSchema = z.object({
  walletId: z.string().min(1, 'Vui lòng chọn ví liên kết'),
  name: z.string().min(1, 'Tên mục tiêu không được để trống').max(150),
  targetAmount: z.number().positive('Số tiền mục tiêu phải lớn hơn 0'),
  initialDeposit: z.number().min(0, 'Số tiền không được âm'),
  targetDate: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type CreateGoalFormData = z.infer<typeof createGoalSchema>;

const actionAmountSchema = z.object({
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
});

type ActionAmountFormData = z.infer<typeof actionAmountSchema>;

// ============================================================
// Modal Tạo Mục Tiêu Mới
// ============================================================
interface CreateModalProps {
  onClose: () => void;
}

function CreateGoalModal({ onClose }: CreateModalProps) {
  const { createSavingGoal, isLoading } = useSavingStore();
  const { wallets } = useWalletStore();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGoalFormData>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      walletId: wallets[0]?.id ?? '',
      name: '',
      targetAmount: 5000000,
      initialDeposit: 0,
      color: '#3B82F6',
      icon: 'piggy',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const selectedWalletId = watch('walletId');

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);
  const availableBalance = selectedWallet?.availableBalance ?? selectedWallet?.balance ?? 0;

  const onSubmit = async (data: CreateGoalFormData) => {
    try {
      const payload: SavingGoalCreateDto = {
        walletId: data.walletId,
        name: data.name,
        targetAmount: data.targetAmount,
        initialDeposit: data.initialDeposit,
        targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
        color: data.color,
        icon: data.icon,
      };
      await createSavingGoal(payload);
      toast.success('Tạo mục tiêu tích lũy thành công!');
      onClose();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Tạo mục tiêu tích lũy mới</h2>
        <p className="text-xs text-slate-500 mb-5">
          Tiền tích lũy sẽ được trích từ số dư khả dụng của ví đã chọn
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên mục tiêu */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên mục tiêu
            </label>
            <input
              {...register('name')}
              placeholder="VD: Mua Macbook, Đi du lịch Nhật..."
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                errors.name ? 'border-red-400' : 'border-slate-200 focus:border-amber-400'
              }`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Chọn Ví liên kết */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Ví trích tiền tích lũy
            </label>
            <select
              {...register('walletId')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Khả dụng: {formatCurrency(w.availableBalance ?? w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Số tiền mục tiêu */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Số tiền mục tiêu cần đạt (VNĐ)
            </label>
            <input
              type="number"
              step="100000"
              {...register('targetAmount', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
            />
            {errors.targetAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.targetAmount.message}</p>
            )}
          </div>

          {/* Nạp ban đầu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Nạp ban đầu (tùy chọn)
              </label>
              <span className="text-xs text-emerald-600 font-medium">
                Tối đa: {formatCurrency(availableBalance)}
              </span>
            </div>
            <input
              type="number"
              step="50000"
              {...register('initialDeposit', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
              placeholder="0"
            />
            {errors.initialDeposit && (
              <p className="mt-1 text-xs text-red-500">{errors.initialDeposit.message}</p>
            )}
          </div>

          {/* Ngày dự kiến hoàn thành */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Hạn chót dự kiến
            </label>
            <input
              type="date"
              {...register('targetDate')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
            />
          </div>

          {/* Biểu tượng */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Biểu tượng
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(GOAL_ICONS).map((key) => {
                const IconComp = GOAL_ICONS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('icon', key)}
                    className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                      selectedIcon === key
                        ? 'border-amber-500 bg-amber-50 text-amber-600 scale-105 shadow-xs'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Màu sắc */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Màu sắc
            </label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                    selectedColor === c ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Modal Nạp Thêm / Rút Tiền Tiết Kiệm
// ============================================================
interface ActionModalProps {
  goal: SavingGoalReadDto;
  mode: 'deposit' | 'withdraw';
  onClose: () => void;
}

function ActionModal({ goal, mode, onClose }: ActionModalProps) {
  const { deposit, withdraw, isLoading } = useSavingStore();
  const { wallets } = useWalletStore();

  const linkedWallet = wallets.find((w) => w.id === goal.walletId);
  const maxAvailable = linkedWallet?.availableBalance ?? linkedWallet?.balance ?? 0;
  const maxWithdrawable = goal.currentAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ActionAmountFormData>({
    resolver: zodResolver(actionAmountSchema),
    defaultValues: {
      amount: mode === 'deposit' ? 100000 : Math.min(100000, maxWithdrawable),
    },
  });

  const onSubmit = async (data: ActionAmountFormData) => {
    try {
      if (mode === 'deposit') {
        if (data.amount > maxAvailable) {
          toast.error('Số dư khả dụng của ví không đủ để nạp thêm.');
          return;
        }
        await deposit(goal.id, { amount: data.amount });
        toast.success(`Đã nạp ${formatCurrency(data.amount)} vào "${goal.name}"!`);
      } else {
        if (data.amount > maxWithdrawable) {
          toast.error('Số tiền rút vượt quá số dư hiện có trong quỹ.');
          return;
        }
        await withdraw(goal.id, { amount: data.amount });
        toast.success(`Đã rút ${formatCurrency(data.amount)} về ví "${goal.walletName}"!`);
      }
      onClose();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          {mode === 'deposit' ? 'Nạp thêm tiền vào quỹ' : 'Rút tiền về ví'}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Mục tiêu: <b>{goal.name}</b> (Ví: {goal.walletName})
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Số tiền (VNĐ)
              </label>
              <span className="text-xs text-emerald-600 font-medium">
                {mode === 'deposit'
                  ? `Khả dụng: ${formatCurrency(maxAvailable)}`
                  : `Trong quỹ: ${formatCurrency(maxWithdrawable)}`}
              </span>
            </div>
            <input
              type="number"
              step="50000"
              {...register('amount', { valueAsNumber: true })}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 ${
                errors.amount ? 'border-red-400' : 'border-slate-200 focus:border-amber-400'
              }`}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors ${
                mode === 'deposit'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isLoading ? 'Đang xử lý...' : mode === 'deposit' ? 'Nạp tiền' : 'Rút về ví'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Trang Chính Mục Tiêu Tích Lũy (SavingGoals Page)
// ============================================================
export default function SavingGoals() {
  const { summary, isLoading, fetchSummary, deleteSavingGoal } = useSavingStore();
  const { fetchWallets } = useWalletStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionTarget, setActionTarget] = useState<{
    goal: SavingGoalReadDto;
    mode: 'deposit' | 'withdraw';
  } | null>(null);

  useEffect(() => {
    fetchSummary();
    fetchWallets();
  }, [fetchSummary, fetchWallets]);

  const handleDelete = async (goal: SavingGoalReadDto) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa mục tiêu "${goal.name}"? Số tiền ${formatCurrency(
          goal.currentAmount
        )} trong quỹ sẽ tự động hoàn về số dư khả dụng của ví.`
      )
    )
      return;

    try {
      await deleteSavingGoal(goal.id);
      toast.success('Đã xóa mục tiêu và giải phóng số tiền khả dụng về ví.');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mục tiêu tích lũy & Tiết kiệm</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Nuôi heo đất ảo, để dành tiền cho những dự định tương lai mà không làm mất số dư thực tế
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          Mục tiêu mới
        </button>
      </div>

      {/* Thẻ Tổng Quan */}
      {summary && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-white/20 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                Tổng tiền đã tích lũy
              </p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(summary.totalSaved)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                Tổng mục tiêu cần đạt
              </p>
              <p className="text-3xl font-bold mt-1 opacity-90">{formatCurrency(summary.totalTarget)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">
                Mục tiêu hoàn thành
              </p>
              <p className="text-3xl font-bold mt-1">
                {summary.completedGoalsCount} / {summary.goals.length}
              </p>
            </div>
          </div>

          {/* Tiến độ tổng thể */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5 text-emerald-100">
              <span>Tiến độ tích lũy toàn bộ mục tiêu</span>
              <span>{summary.overallPercentage}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-300 transition-all duration-500"
                style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Danh sách Mục Tiêu */}
      {isLoading && (!summary || summary.goals.length === 0) ? (
        <div className="text-center py-16 text-slate-400">Đang tải mục tiêu tích lũy...</div>
      ) : !summary || summary.goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <PiggyBank size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Chưa có mục tiêu tiết kiệm nào</p>
          <p className="text-xs text-slate-400 mt-1">
            Tạo mục tiêu để dành tiền mua xe, laptop hoặc quỹ khẩn cấp ngay hôm nay!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors"
          >
            Tạo mục tiêu ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.goals.map((goal) => {
            const IconComp = (goal.icon && GOAL_ICONS[goal.icon]) || PiggyBank;

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-shadow hover:shadow-md space-y-4 ${
                  goal.isCompleted ? 'border-emerald-300 ring-1 ring-emerald-300/60' : 'border-slate-200/80'
                }`}
              >
                {/* Header card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white"
                      style={{ backgroundColor: goal.color || '#3B82F6' }}
                    >
                      <IconComp size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-800">{goal.name}</span>
                        {goal.isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} /> Đã đạt mục tiêu!
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <Wallet size={12} className="text-slate-400" />
                          {goal.walletName}
                        </span>
                        {goal.targetDate && (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <Calendar size={12} />
                            Hạn: {new Date(goal.targetDate).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(goal)}
                    title="Xóa mục tiêu"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Thanh tiến độ */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Đã có: <b className="text-emerald-600 font-bold">{formatCurrency(goal.currentAmount)}</b>
                    </span>
                    <span className="text-slate-500">
                      Mục tiêu: <b className="text-slate-800">{formatCurrency(goal.targetAmount)}</b>
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.isCompleted ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      {goal.remainingAmount > 0
                        ? `Còn thiếu ${formatCurrency(goal.remainingAmount)}`
                        : '🎉 Đã hoàn thành xuất sắc!'}
                    </span>
                    <span className="font-bold text-slate-700">{goal.percentage}%</span>
                  </div>
                </div>

                {/* Action Buttons: Nạp tiền / Rút tiền */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActionTarget({ goal, mode: 'deposit' })}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    <ArrowDownRight size={14} />
                    Nạp thêm tiền
                  </button>
                  <button
                    onClick={() => setActionTarget({ goal, mode: 'withdraw' })}
                    disabled={goal.currentAmount <= 0}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors border border-slate-200"
                  >
                    <ArrowUpRight size={14} />
                    Rút về ví
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <CreateGoalModal onClose={() => setShowCreateModal(false)} />}

      {actionTarget && (
        <ActionModal
          goal={actionTarget.goal}
          mode={actionTarget.mode}
          onClose={() => setActionTarget(null)}
        />
      )}
    </div>
  );
}
