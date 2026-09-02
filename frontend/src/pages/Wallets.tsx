import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Star,
  Landmark,
  CreditCard,
  Smartphone,
  CircleEllipsis,
} from 'lucide-react';
import { useWalletStore } from '@/store/useWalletStore';
import type { WalletCreateDto, WalletReadDto, WalletType, WalletUpdateDto } from '@/types/wallet.types';
import { WALLET_TYPE_LABELS } from '@/types/wallet.types';

// ============================================================
// Schema & Types
// ============================================================
const walletSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống').max(100),
  type: z.enum(['Cash', 'BankAccount', 'CreditCard', 'EWallet', 'Other']),
  balance: z.number().min(0, 'Số dư không được âm'),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6})$/, 'Màu không hợp lệ (vd: #3B82F6)')
    .optional()
    .or(z.literal('')),
  isDefault: z.boolean(),
});

type WalletFormData = z.infer<typeof walletSchema>;

// ============================================================
// Helpers
// ============================================================
const WALLET_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280',
];

const WALLET_TYPES: WalletType[] = ['Cash', 'BankAccount', 'CreditCard', 'EWallet', 'Other'];

function WalletIcon({ type, color }: { type: WalletType; color?: string }) {
  const cls = `w-5 h-5 text-white`;
  const icons = {
    Cash: <Wallet className={cls} />,
    BankAccount: <Landmark className={cls} />,
    CreditCard: <CreditCard className={cls} />,
    EWallet: <Smartphone className={cls} />,
    Other: <CircleEllipsis className={cls} />,
  };
  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
      style={{ backgroundColor: color || '#6B7280' }}
    >
      {icons[type]}
    </div>
  );
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// ============================================================
// Modal tạo / chỉnh sửa ví
// ============================================================
interface WalletModalProps {
  editTarget?: WalletReadDto | null;
  onClose: () => void;
}

function WalletModal({ editTarget, onClose }: WalletModalProps) {
  const { createWallet, updateWallet, isLoading } = useWalletStore();
  const isEdit = !!editTarget;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<WalletFormData>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: editTarget?.name ?? '',
      type: (editTarget?.type as WalletType) ?? 'Cash',
      balance: editTarget?.balance ?? 0,
      color: editTarget?.color ?? '#3B82F6',
      isDefault: editTarget?.isDefault ?? false,
    },
  });

  const selectedColor = watch('color');

  const onSubmit = async (data: WalletFormData) => {
    try {
      if (isEdit) {
        const updateData: WalletUpdateDto = {
          name: data.name,
          type: data.type,
          color: data.color || undefined,
        };
        await updateWallet(editTarget!.id, updateData);
        toast.success('Cập nhật ví thành công!');
      } else {
        const createData: WalletCreateDto = {
          name: data.name,
          type: data.type,
          balance: data.balance,
          color: data.color || undefined,
          isDefault: data.isDefault,
        };
        await createWallet(createData);
        toast.success('Tạo ví thành công!');
      }
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string }).message || 'Có lỗi xảy ra';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          {isEdit ? 'Chỉnh sửa ví' : 'Tạo ví mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tên ví */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Tên ví
            </label>
            <input
              {...register('name')}
              className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="VD: Ví tiền mặt, MB Bank..."
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Loại ví */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Loại ví
            </label>
            <select
              {...register('type')}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:border-amber-400 focus:ring-amber-400/20"
            >
              {WALLET_TYPES.map((t) => (
                <option key={t} value={t}>{WALLET_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          {/* Số dư ban đầu (chỉ hiện khi tạo mới) */}
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Số dư ban đầu (VNĐ)
              </label>
              <input
                type="number"
                {...register('balance', { valueAsNumber: true })}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  errors.balance
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
                }`}
                placeholder="0"
              />
              {errors.balance && <p className="mt-1 text-xs text-red-500">{errors.balance.message}</p>}
            </div>
          )}

          {/* Màu sắc */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Màu sắc
            </label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                    selectedColor === c ? 'border-slate-800 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Đặt làm mặc định (chỉ khi tạo mới) */}
          {!isEdit && (
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-sm text-slate-700">Đặt làm ví mặc định</span>
            </label>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
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
              {isLoading ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Tạo ví'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Trang chính Wallets
// ============================================================
export default function Wallets() {
  const { wallets, isLoading, fetchWallets, deleteWallet, setDefaultWallet } = useWalletStore();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<WalletReadDto | null>(null);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const handleDelete = async (wallet: WalletReadDto) => {
    if (!confirm(`Bạn có chắc muốn xóa ví "${wallet.name}"?`)) return;
    try {
      await deleteWallet(wallet.id);
      toast.success('Đã xóa ví.');
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Xóa ví thất bại.');
    }
  };

  const handleSetDefault = async (wallet: WalletReadDto) => {
    if (wallet.isDefault) return;
    try {
      await setDefaultWallet(wallet.id);
      toast.success(`Đã đặt "${wallet.name}" làm ví mặc định.`);
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Có lỗi xảy ra.');
    }
  };

  const openCreate = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (w: WalletReadDto) => { setEditTarget(w); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ví & Tài khoản</h1>
          <p className="text-sm text-slate-500 mt-0.5">Quản lý các nguồn tiền của bạn</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Thêm ví
        </button>
      </div>

      {/* Tổng số dư */}
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl p-6 mb-6 text-slate-900 shadow-sm">
        <p className="text-sm font-medium opacity-80">Tổng số dư</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
        <p className="text-xs opacity-70 mt-1">{wallets.length} ví đang hoạt động</p>
      </div>

      {/* Danh sách ví */}
      {isLoading && wallets.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Đang tải...</div>
      ) : wallets.length === 0 ? (
        <div className="text-center py-16">
          <Wallet size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Chưa có ví nào</p>
          <p className="text-sm text-slate-400 mt-1">Tạo ví đầu tiên để bắt đầu quản lý tài chính</p>
          <button
            onClick={openCreate}
            className="mt-4 rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 transition-colors"
          >
            Tạo ví ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map((wallet) => (
            <div
              key={wallet.id}
              className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
                wallet.isDefault ? 'border-amber-300 ring-1 ring-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <WalletIcon type={wallet.type} color={wallet.color} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-800 text-sm">{wallet.name}</span>
                      {wallet.isDefault && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full font-medium">
                          <Star size={10} fill="currentColor" /> Mặc định
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{WALLET_TYPE_LABELS[wallet.type]}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {!wallet.isDefault && (
                    <button
                      onClick={() => handleSetDefault(wallet)}
                      title="Đặt làm mặc định"
                      className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Star size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(wallet)}
                    title="Chỉnh sửa"
                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(wallet)}
                    title="Xóa ví"
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Số dư */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">Số dư hiện tại</p>
                <p className={`text-xl font-bold ${wallet.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && <WalletModal editTarget={editTarget} onClose={closeModal} />}
    </div>
  );
}
