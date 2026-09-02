import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  FolderTree,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
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
  TrendingUp,
  DollarSign,
  Coffee,
  Zap,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import { useCategoryStore } from '@/store/useCategoryStore';
import type {
  CategoryCreateDto,
  CategoryReadDto,
  CategoryUpdateDto,
  TransactionType,
} from '@/types/category.types';
import { TRANSACTION_TYPE_LABELS } from '@/types/category.types';

// ============================================================
// Định nghĩa Icon & Màu sắc có sẵn
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
  'trending-up': TrendingUp,
  'dollar-sign': DollarSign,
  coffee: Coffee,
  zap: Zap,
  tag: Tag,
};

const CATEGORY_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#64748B',
];

function CategoryIcon({
  iconName,
  color,
  size = 20,
}: {
  iconName?: string;
  color?: string;
  size?: number;
}) {
  const IconComponent = (iconName && ICON_MAP[iconName]) || Tag;
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
      style={{ backgroundColor: color || '#64748B' }}
    >
      <IconComponent size={size} className="text-white" />
    </div>
  );
}

// ============================================================
// Schema
// ============================================================
const categorySchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100),
  type: z.enum(['Income', 'Expense']),
  icon: z.string().optional(),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Mã màu không hợp lệ')
    .optional()
    .or(z.literal('')),
});

type CategoryFormData = z.infer<typeof categorySchema>;

// ============================================================
// Modal Tạo / Sửa danh mục
// ============================================================
interface CategoryModalProps {
  editTarget?: CategoryReadDto | null;
  onClose: () => void;
}

function CategoryModal({ editTarget, onClose }: CategoryModalProps) {
  const { createCategory, updateCategory, isLoading } = useCategoryStore();
  const isEdit = !!editTarget;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: editTarget?.name ?? '',
      type: editTarget?.type ?? 'Expense',
      icon: editTarget?.icon ?? 'tag',
      color: editTarget?.color ?? '#EF4444',
    },
  });

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const selectedType = watch('type');

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (isEdit) {
        const updateData: CategoryUpdateDto = {
          name: data.name,
          icon: data.icon,
          color: data.color || undefined,
        };
        await updateCategory(editTarget!.id, updateData);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        const createData: CategoryCreateDto = {
          name: data.name,
          type: data.type as TransactionType,
          icon: data.icon,
          color: data.color || undefined,
        };
        await createCategory(createData);
        toast.success('Tạo danh mục thành công!');
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Có lỗi xảy ra';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          {isEdit ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên danh mục */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên danh mục
            </label>
            <input
              {...register('name')}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="VD: Ăn uống, Tiền lương..."
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Loại danh mục (Thu nhập / Chi tiêu) - Chỉ chọn khi tạo mới */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Loại giao dịch
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setValue('type', 'Expense')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedType === 'Expense'
                      ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔴 Chi tiêu (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => setValue('type', 'Income')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    selectedType === 'Income'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🟢 Thu nhập (Income)
                </button>
              </div>
            </div>
          )}

          {/* Chọn Biểu tượng (Icon) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Biểu tượng
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Object.keys(ICON_MAP).map((iconKey) => {
                const IconComponent = ICON_MAP[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setValue('icon', iconKey)}
                    className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-xs scale-105'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <IconComponent size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chọn Màu sắc */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Màu sắc
            </label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                    selectedColor === c
                      ? 'border-slate-800 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
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
              {isLoading
                ? 'Đang xử lý...'
                : isEdit
                ? 'Lưu thay đổi'
                : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Trang chính Danh mục (Categories Page)
// ============================================================
export default function Categories() {
  const { categories, isLoading, fetchCategories, deleteCategory } =
    useCategoryStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'Expense' | 'Income'>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryReadDto | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    if (activeTab === 'ALL') return categories;
    return categories.filter((c) => c.type === activeTab);
  }, [categories, activeTab]);

  const expenseCount = useMemo(
    () => categories.filter((c) => c.type === 'Expense').length,
    [categories]
  );
  const incomeCount = useMemo(
    () => categories.filter((c) => c.type === 'Income').length,
    [categories]
  );

  const handleDelete = async (cat: CategoryReadDto) => {
    if (cat.isDefault) {
      toast.error('Không thể xóa danh mục mặc định của hệ thống.');
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      toast.success('Đã xóa danh mục.');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string }).message || 'Xóa danh mục thất bại.'
      );
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (cat: CategoryReadDto) => {
    if (cat.isDefault) {
      toast.error('Không thể chỉnh sửa danh mục mặc định của hệ thống.');
      return;
    }
    setEditTarget(cat);
    setShowModal(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Danh mục Thu / Chi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Phân loại và quản lý các nhóm giao dịch tài chính
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Thêm danh mục
        </button>
      </div>

      {/* Tabs Bộ lọc */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('Expense')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'Expense'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'text-rose-600 bg-rose-50/50 hover:bg-rose-100/70'
          }`}
        >
          Chi tiêu ({expenseCount})
        </button>
        <button
          onClick={() => setActiveTab('Income')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'Income'
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100/70'
          }`}
        >
          Thu nhập ({incomeCount})
        </button>
      </div>

      {/* Danh sách categories */}
      {isLoading && categories.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Đang tải...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-16">
          <FolderTree size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Không có danh mục nào</p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors"
          >
            Tạo danh mục ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <CategoryIcon iconName={cat.icon} color={cat.color} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800 text-sm truncate">
                      {cat.name}
                    </span>
                    {cat.isDefault && (
                      <span
                        title="Danh mục mặc định của hệ thống"
                        className="inline-flex items-center text-slate-400"
                      >
                        <ShieldCheck size={14} className="text-amber-500" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                        cat.type === 'Income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {TRANSACTION_TYPE_LABELS[cat.type]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons (chỉ cho phép sửa/xóa nếu không phải là isDefault) */}
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {!cat.isDefault ? (
                  <>
                    <button
                      onClick={() => openEdit(cat)}
                      title="Chỉnh sửa"
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      title="Xóa danh mục"
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md font-medium">
                    Hệ thống
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CategoryModal
          editTarget={editTarget}
          onClose={() => {
            setShowModal(false);
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}
