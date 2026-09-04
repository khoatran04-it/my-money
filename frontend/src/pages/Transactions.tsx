import { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Plus,
  Pencil,
  Trash2,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  ReceiptText,
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
  FileSpreadsheet,
  type LucideIcon,
} from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useCategoryStore } from '@/store/useCategoryStore';
import { Dropdown } from '@/components/ui/Dropdown';
import { DatePicker } from '@/components/ui/DatePicker';
import { NumberInput } from '@/components/ui/NumberInput';
import type {
  TransactionCreateDto,
  TransactionReadDto,
  TransactionUpdateDto,
} from '@/types/transaction.types';
import type { TransactionType } from '@/types/category.types';

// ============================================================
// Mapping icon và helpers
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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDateString(isoString: string) {
  const d = new Date(isoString);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const dayFormatted = d.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return isToday ? `Hôm nay, ${dayFormatted}` : dayFormatted;
}

// ============================================================
// Schema
// ============================================================
const transactionSchema = z.object({
  walletId: z.string().min(1, 'Vui lòng chọn ví'),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  type: z.enum(['Income', 'Expense']),
  date: z.string().min(1, 'Vui lòng chọn ngày'),
  note: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

// ============================================================
// Modal Tạo / Chỉnh sửa Giao dịch
// ============================================================
interface TransactionModalProps {
  editTarget?: TransactionReadDto | null;
  onClose: () => void;
}

function TransactionModal({ editTarget, onClose }: TransactionModalProps) {
  const { createTransaction, updateTransaction, isLoading } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { categories } = useCategoryStore();
  const isEdit = !!editTarget;

  const defaultDate = editTarget
    ? format(new Date(editTarget.date), 'yyyy-MM-dd')
    : format(new Date(), 'yyyy-MM-dd');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      walletId: editTarget?.walletId ?? wallets[0]?.id ?? '',
      categoryId: editTarget?.categoryId ?? '',
      amount: editTarget?.amount ?? 0,
      type: editTarget?.type ?? 'Expense',
      date: defaultDate,
      note: editTarget?.note ?? '',
    },
  });

  const selectedType = watch('type');
  const selectedWalletId = watch('walletId');
  const selectedWallet = useMemo(
    () => wallets.find((w) => w.id === selectedWalletId),
    [wallets, selectedWalletId]
  );

  // Lọc danh mục phù hợp theo Loại giao dịch được chọn (Thu hoặc Chi)
  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === selectedType),
    [categories, selectedType]
  );

  // Tự động gán category đầu tiên nếu categoryId hiện tại không thuộc danh sách hợp lệ
  useEffect(() => {
    const currentCatId = watch('categoryId');
    const isCatValid = availableCategories.some((c) => c.id === currentCatId);
    if (!isCatValid && availableCategories.length > 0) {
      setValue('categoryId', availableCategories[0].id);
    }
  }, [selectedType, availableCategories, setValue, watch]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      if (data.type === 'Expense' && selectedWallet) {
        const currentBalance = selectedWallet.availableBalance ?? selectedWallet.balance;
        const available =
          isEdit && editTarget?.walletId === data.walletId && editTarget.type === 'Expense'
            ? currentBalance + editTarget.amount
            : currentBalance;

        if (data.amount > available) {
          toast.error(
            `Số dư khả dụng của ví '${selectedWallet.name}' (${formatCurrency(available)}) không đủ để thực hiện khoản chi ${formatCurrency(data.amount)}.`
          );
          return;
        }
      }
      if (isEdit) {
        const updateData: TransactionUpdateDto = {
          walletId: data.walletId,
          categoryId: data.categoryId,
          amount: data.amount,
          type: data.type as TransactionType,
          date: new Date(data.date + 'T12:00:00').toISOString(),
          note: data.note || undefined,
        };
        await updateTransaction(editTarget!.id, updateData);
        toast.success('Cập nhật giao dịch thành công!');
      } else {
        const createData: TransactionCreateDto = {
          walletId: data.walletId,
          categoryId: data.categoryId,
          amount: data.amount,
          type: data.type as TransactionType,
          date: new Date(data.date + 'T12:00:00').toISOString(),
          note: data.note || undefined,
        };
        await createTransaction(createData);
        toast.success('Thêm giao dịch thành công!');
      }
      onClose();
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          {isEdit ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Loại giao dịch */}
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
              🔴 Chi tiêu
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
              🟢 Thu nhập
            </button>
          </div>

          {/* Số tiền */}
          <NumberInput
            label="Số tiền"
            suffix="VNĐ"
            value={watch('amount')}
            onValueChange={(val) => setValue('amount', val ?? 0, { shouldValidate: true })}
            error={errors.amount?.message}
            placeholder="0"
            helperText={
              selectedType === 'Expense' && selectedWallet ? (
                <div className="flex items-center justify-between text-xs mt-0.5">
                  <span className="text-slate-500">Khả dụng trong ví:</span>
                  <span
                    className={`font-semibold ${
                      (selectedWallet.availableBalance ?? selectedWallet.balance) <
                      (watch('amount') || 0)
                        ? 'text-red-500'
                        : 'text-emerald-600'
                    }`}
                  >
                    {formatCurrency(selectedWallet.availableBalance ?? selectedWallet.balance)}
                  </span>
                </div>
              ) : null
            }
          />

          {/* Chọn Ví */}
          <Dropdown
            label="Tài khoản / Ví"
            value={watch('walletId')}
            onValueChange={(val) => setValue('walletId', val)}
            options={wallets.map((w) => ({
              label: `${w.name} (Khả dụng: ${formatCurrency(w.availableBalance ?? w.balance)})`,
              value: w.id,
            }))}
            error={errors.walletId?.message}
          />

          {/* Chọn Danh mục */}
          <Dropdown
            label="Danh mục"
            value={watch('categoryId')}
            onValueChange={(val) => setValue('categoryId', val)}
            options={availableCategories.map((c) => ({
              label: c.name,
              value: c.id,
            }))}
            placeholder={availableCategories.length === 0 ? 'Chưa có danh mục nào' : 'Chọn danh mục...'}
            error={errors.categoryId?.message}
          />

          {/* Ngày giao dịch */}
          <DatePicker
            label="Ngày thực hiện"
            date={watch('date') ? new Date(watch('date') + 'T12:00:00') : undefined}
            onSelect={(d) => setValue('date', d ? format(d, 'yyyy-MM-dd') : '')}
            error={errors.date?.message}
          />

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Ghi chú
            </label>
            <input
              type="text"
              {...register('note')}
              placeholder="VD: Cơm trưa với đồng nghiệp, Mua sách..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400"
            />
            {errors.note && (
              <p className="mt-1 text-xs text-red-500">{errors.note.message}</p>
            )}
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
              {isLoading ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Thêm giao dịch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Trang Sổ giao dịch (Transactions Page)
// ============================================================
export default function Transactions() {
  const {
    transactions,
    totalCount,
    pageNumber,
    totalPages,
    isLoading,
    fetchTransactions,
    deleteTransaction,
    setFilter,
    setPage,
  } = useTransactionStore();

  const { wallets, fetchWallets } = useWalletStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionReadDto | null>(null);

  // Local state cho search input
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
    fetchCategories();
  }, [fetchTransactions, fetchWallets, fetchCategories]);

  // Thống kê nhanh trong trang hiện tại
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === 'Income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Gom nhóm giao dịch theo ngày
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, TransactionReadDto[]> = {};
    transactions.forEach((t) => {
      const dateKey = t.date.split('T')[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(t);
    });
    return groups;
  }, [transactions]);

  const handleApplyFilter = () => {
    setFilter({
      search: searchTerm.trim() || undefined,
      type: selectedType !== 'ALL' ? (selectedType as TransactionType) : undefined,
      walletId: selectedWalletId !== 'ALL' ? selectedWalletId : undefined,
      categoryId: selectedCategoryId !== 'ALL' ? selectedCategoryId : undefined,
    });
  };

  const handleResetFilter = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedWalletId('ALL');
    setSelectedCategoryId('ALL');
    setFilter({
      search: undefined,
      type: undefined,
      walletId: undefined,
      categoryId: undefined,
    });
  };

  const handleDelete = async (trans: TransactionReadDto) => {
    if (!confirm('Bạn có chắc muốn xóa giao dịch này? Số dư ví sẽ được tự động hoàn tác.'))
      return;
    try {
      await deleteTransaction(trans.id);
      toast.success('Đã xóa giao dịch và hoàn tất điều chỉnh số dư.');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Xóa giao dịch thất bại.');
    }
  };

  const openCreate = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  const openEdit = (t: TransactionReadDto) => {
    setEditTarget(t);
    setShowModal(true);
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Không có giao dịch nào để xuất!');
      return;
    }

    const headers = ['Mã GD', 'Ngày giao dịch', 'Tài khoản / Ví', 'Danh mục', 'Loại', 'Số tiền (VNĐ)', 'Ghi chú'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${new Date(t.date).toLocaleDateString('vi-VN')}"`,
      `"${t.walletName ?? ''}"`,
      `"${t.categoryName ?? 'Không phân loại'}"`,
      `"${t.type === 'Income' ? 'Thu nhập' : 'Chi tiêu'}"`,
      t.amount,
      `"${(t.note ?? '').replace(/"/g, '""')}"`,
    ]);

    // Thêm UTF-8 BOM (\uFEFF) để Microsoft Excel hiển thị tiếng Việt có dấu chuẩn 100%
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `So_Giao_Dich_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Xuất file CSV / Excel thành công!');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sổ giao dịch</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý dòng tiền và lịch sử thu chi của bạn
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            title="Xuất danh sách giao dịch ra file CSV / Excel"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors shadow-2xs"
          >
            <FileSpreadsheet size={16} className="text-emerald-600" />
            Xuất Excel / CSV
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors shadow-sm shrink-0"
          >
            <Plus size={16} />
            Ghi chép giao dịch
          </button>
        </div>
      </div>

      {/* Thẻ thống kê tóm tắt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Tổng thu</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">
            +{formatCurrency(stats.income)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Tổng chi</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown size={18} />
            </div>
          </div>
          <p className="text-xl font-bold text-rose-600 mt-2">
            -{formatCurrency(stats.expense)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Dòng tiền ròng</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ReceiptText size={18} />
            </div>
          </div>
          <p
            className={`text-xl font-bold mt-2 ${
              stats.balance >= 0 ? 'text-slate-800' : 'text-rose-500'
            }`}
          >
            {formatCurrency(stats.balance)}
          </p>
        </div>
      </div>

      {/* Thanh bộ lọc và tìm kiếm */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tìm kiếm theo ghi chú */}
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Lọc loại thu/chi */}
          <Dropdown
            value={selectedType}
            onValueChange={(val) => setSelectedType(val)}
            options={[
              { label: 'Tất cả loại giao dịch', value: 'ALL' },
              { label: 'Chi tiêu (Expense)', value: 'Expense' },
              { label: 'Thu nhập (Income)', value: 'Income' },
            ]}
          />

          {/* Lọc theo Ví */}
          <Dropdown
            value={selectedWalletId}
            onValueChange={(val) => setSelectedWalletId(val)}
            options={[
              { label: 'Tất cả ví', value: 'ALL' },
              ...wallets.map((w) => ({ label: w.name, value: w.id })),
            ]}
          />

          {/* Lọc theo Danh mục */}
          <Dropdown
            value={selectedCategoryId}
            onValueChange={(val) => setSelectedCategoryId(val)}
            options={[
              { label: 'Tất cả danh mục', value: 'ALL' },
              ...categories.map((c) => ({
                label: `${c.name} (${c.type === 'Income' ? 'Thu' : 'Chi'})`,
                value: c.id,
              })),
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
          <button
            onClick={handleResetFilter}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
          >
            Đặt lại
          </button>
          <button
            onClick={handleApplyFilter}
            className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            <Filter size={14} />
            Lọc kết quả
          </button>
        </div>
      </div>

      {/* Danh sách giao dịch phân nhóm theo ngày */}
      {isLoading && transactions.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Đang tải dữ liệu...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
          <ReceiptText size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Chưa có giao dịch nào phù hợp</p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors"
          >
            Thêm giao dịch ngay
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.keys(groupedTransactions).map((dateKey) => {
            const list = groupedTransactions[dateKey];
            const dateTotal = list.reduce(
              (sum, item) => (item.type === 'Income' ? sum + item.amount : sum - item.amount),
              0
            );

            return (
              <div
                key={dateKey}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
              >
                {/* Header ngày */}
                <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {formatDateString(list[0].date)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      dateTotal >= 0 ? 'text-emerald-600' : 'text-slate-600'
                    }`}
                  >
                    {dateTotal > 0 ? `+${formatCurrency(dateTotal)}` : formatCurrency(dateTotal)}
                  </span>
                </div>

                {/* Danh sách các giao dịch trong ngày */}
                <div className="divide-y divide-slate-100">
                  {list.map((item) => {
                    const IconComp =
                      (item.categoryIcon && ICON_MAP[item.categoryIcon]) || Tag;

                    return (
                      <div
                        key={item.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-white"
                            style={{ backgroundColor: item.categoryColor || '#64748B' }}
                          >
                            <IconComp size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800 truncate">
                                {item.categoryName || 'Không phân loại'}
                              </span>
                              <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md shrink-0">
                                {item.walletName || 'Ví'}
                              </span>
                            </div>
                            {item.note && (
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                                {item.note}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Số tiền & Thao tác */}
                        <div className="flex items-center gap-4 shrink-0 ml-3">
                          <span
                            className={`text-sm sm:text-base font-bold text-right ${
                              item.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {item.type === 'Income' ? '+' : '-'}
                            {formatCurrency(item.amount)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              title="Chỉnh sửa"
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              title="Xóa"
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Điều khiển phân trang */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Tổng cộng <b>{totalCount}</b> giao dịch (Trang {pageNumber} / {totalPages})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(pageNumber - 1)}
              disabled={pageNumber <= 1}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(pageNumber + 1)}
              disabled={pageNumber >= totalPages}
              className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TransactionModal
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
