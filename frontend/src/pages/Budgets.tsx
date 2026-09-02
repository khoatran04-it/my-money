import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  PieChart,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Gift,
  Briefcase,
  DollarSign,
  Coffee,
  Zap,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { useBudgetStore } from '@/store/useBudgetStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import type {
  BudgetCreateDto,
  BudgetReadDto,
  BudgetUpdateDto,
} from '@/types/budget.types';

// ============================================================
// Mapping icons & Helpers
// ============================================================
const ICON_MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  'shopping-bag': ShoppingBag,
  car: Car,
  home: Home,
  film: Film,
  'heart-pulse': HeartPulse,
  'graduation-cap': GraduationCap,
  plane: Plane,
  gift: Gift,
  briefcase: Briefcase,
  'dollar-sign': DollarSign,
  coffee: Coffee,
  zap: Zap,
  tag: Tag,
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ============================================================
// Schemas
// ============================================================
const budgetCreateSchema = z.object({
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  limitAmount: z.number().positive('Hạn mức phải lớn hơn 0'),
});

type BudgetCreateFormData = z.infer<typeof budgetCreateSchema>;

const budgetUpdateSchema = z.object({
  limitAmount: z.number().positive('Hạn mức phải lớn hơn 0'),
});

type BudgetUpdateFormData = z.infer<typeof budgetUpdateSchema>;

// ============================================================
// Modal Tạo Mới Ngân Sách
// ============================================================
interface CreateModalProps {
  month: number;
  year: number;
  existingCategoryIds: string[];
  onClose: () => void;
}

function CreateBudgetModal({ month, year, existingCategoryIds, onClose }: CreateModalProps) {
  const { createBudget, isLoading } = useBudgetStore();
  const { categories } = useCategoryStore();

  // Chỉ lấy danh mục Chi tiêu và chưa được đặt ngân sách trong tháng này
  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === 'Expense' && !existingCategoryIds.includes(c.id)),
    [categories, existingCategoryIds]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetCreateFormData>({
    resolver: zodResolver(budgetCreateSchema),
    defaultValues: {
      categoryId: availableCategories[0]?.id ?? '',
      limitAmount: 1000000,
    },
  });

  const onSubmit = async (data: BudgetCreateFormData) => {
    try {
      const payload: BudgetCreateDto = {
        categoryId: data.categoryId,
        limitAmount: data.limitAmount,
        month,
        year,
      };
      await createBudget(payload);
      toast.success('Thiết lập hạn mức ngân sách thành công!');
      onClose();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Thiết lập ngân sách tháng {month}/{year}
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Đặt giới hạn chi tiêu tối đa cho một danh mục trong tháng
        </p>

        {availableCategories.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-600 font-medium">
              Tất cả danh mục chi tiêu đã được đặt hạn mức trong tháng này!
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Chọn Danh mục */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Danh mục chi tiêu
              </label>
              <select
                {...register('categoryId')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Hạn mức số tiền */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Hạn mức tối đa (VNĐ)
              </label>
              <input
                type="number"
                step="50000"
                {...register('limitAmount', { valueAsNumber: true })}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.limitAmount
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
                placeholder="VD: 3000000"
              />
              {errors.limitAmount && (
                <p className="mt-1 text-xs text-red-500">{errors.limitAmount.message}</p>
              )}
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
                {isLoading ? 'Đang tạo...' : 'Tạo ngân sách'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Modal Chỉnh Sửa Hạn Mức
// ============================================================
interface EditModalProps {
  budget: BudgetReadDto;
  onClose: () => void;
}

function EditBudgetModal({ budget, onClose }: EditModalProps) {
  const { updateBudget, isLoading } = useBudgetStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetUpdateFormData>({
    resolver: zodResolver(budgetUpdateSchema),
    defaultValues: {
      limitAmount: budget.limitAmount,
    },
  });

  const onSubmit = async (data: BudgetUpdateFormData) => {
    try {
      const payload: BudgetUpdateDto = { limitAmount: data.limitAmount };
      await updateBudget(budget.id, payload);
      toast.success('Cập nhật hạn mức thành công!');
      onClose();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Chỉnh sửa hạn mức
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Danh mục: <b>{budget.categoryName}</b> (Tháng {budget.month}/{budget.year})
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Hạn mức mới (VNĐ)
            </label>
            <input
              type="number"
              step="50000"
              {...register('limitAmount', { valueAsNumber: true })}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-base font-bold text-slate-800 focus:outline-none focus:ring-2 ${
                errors.limitAmount
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400'
              }`}
            />
            {errors.limitAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.limitAmount.message}</p>
            )}
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
              {isLoading ? 'Đang lưu...' : 'Lưu hạn mức'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Trang chính Ngân sách (Budgets Page)
// ============================================================
export default function Budgets() {
  const { summary, month, year, isLoading, fetchSummary, deleteBudget, setMonthYear } =
    useBudgetStore();
  const { fetchCategories } = useCategoryStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<BudgetReadDto | null>(null);

  useEffect(() => {
    fetchSummary(month, year);
    fetchCategories();
  }, [fetchSummary, fetchCategories, month, year]);

  const handlePrevMonth = () => {
    if (month === 1) setMonthYear(12, year - 1);
    else setMonthYear(month - 1, year);
  };

  const handleNextMonth = () => {
    if (month === 12) setMonthYear(1, year + 1);
    else setMonthYear(month + 1, year);
  };

  const handleDelete = async (b: BudgetReadDto) => {
    if (!confirm(`Bạn có chắc muốn xóa ngân sách của danh mục "${b.categoryName}"?`)) return;
    try {
      await deleteBudget(b.id);
      toast.success('Đã xóa ngân sách.');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Xóa ngân sách thất bại.');
    }
  };

  const existingCategoryIds = useMemo(
    () => summary?.budgets.map((b) => b.categoryId) ?? [],
    [summary]
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header & Điều hướng Tháng */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hạn mức ngân sách</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kiểm soát chi tiêu và theo dõi mức độ tiêu dùng theo từng danh mục
          </p>
        </div>

        {/* Bộ chọn tháng */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl shadow-2xs p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 select-none">
              Tháng {month} / {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} />
            Đặt hạn mức
          </button>
        </div>
      </div>

      {/* Thẻ Tổng quan ngân sách tháng */}
      {summary && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">
                Tổng hạn mức
              </span>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {formatCurrency(summary.totalLimit)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">
                Đã chi tiêu
              </span>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                {formatCurrency(summary.totalSpent)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-slate-500">
                {summary.totalRemaining >= 0 ? 'Còn lại' : 'Bội chi'}
              </span>
              <p
                className={`text-2xl font-bold mt-1 ${
                  summary.totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {formatCurrency(Math.abs(summary.totalRemaining))}
              </p>
            </div>
          </div>

          {/* Thanh tiến độ tổng thể */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Tiến độ chi tiêu toàn bộ danh mục</span>
              <span
                className={`${
                  summary.overallPercentage > 100
                    ? 'text-rose-600'
                    : summary.overallPercentage > 80
                    ? 'text-amber-600'
                    : 'text-slate-700'
                }`}
              >
                {summary.overallPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.overallPercentage > 100
                    ? 'bg-rose-500'
                    : summary.overallPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Danh sách từng ngân sách */}
      {isLoading && (!summary || summary.budgets.length === 0) ? (
        <div className="text-center py-16 text-slate-400">Đang tải ngân sách...</div>
      ) : !summary || summary.budgets.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <PieChart size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Chưa có ngân sách nào trong tháng {month}/{year}</p>
          <p className="text-xs text-slate-400 mt-1">
            Đặt hạn mức cho các danh mục như Ăn uống, Mua sắm để tránh chi tiêu quá đà
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors"
          >
            Thiết lập ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary.budgets.map((b) => {
            const IconComp = (b.categoryIcon && ICON_MAP[b.categoryIcon]) || Tag;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-shadow hover:shadow-md space-y-4 ${
                  b.isOverBudget
                    ? 'border-rose-300 ring-1 ring-rose-300/60'
                    : 'border-slate-200/80'
                }`}
              >
                {/* Header card */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white"
                      style={{ backgroundColor: b.categoryColor || '#64748B' }}
                    >
                      <IconComp size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800">
                          {b.categoryName}
                        </span>
                        {b.isOverBudget && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle size={10} /> Vượt hạn mức!
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        Hạn mức: <b>{formatCurrency(b.limitAmount)}</b>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditTarget(b)}
                      title="Sửa hạn mức"
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(b)}
                      title="Xóa ngân sách"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Thanh tiến độ cá nhân */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Đã chi: <b className="text-rose-600">{formatCurrency(b.spentAmount)}</b>
                    </span>
                    <span
                      className={`font-bold ${
                        b.isOverBudget
                          ? 'text-rose-600'
                          : b.percentage > 80
                          ? 'text-amber-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.isOverBudget
                          ? 'bg-rose-500'
                          : b.percentage > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      {b.remainingAmount >= 0 ? 'Còn lại: ' : 'Vượt quá: '}
                      <b
                        className={
                          b.remainingAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }
                      >
                        {formatCurrency(Math.abs(b.remainingAmount))}
                      </b>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateBudgetModal
          month={month}
          year={year}
          existingCategoryIds={existingCategoryIds}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editTarget && (
        <EditBudgetModal
          budget={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
