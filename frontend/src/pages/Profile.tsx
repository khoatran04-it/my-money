import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  User as UserIcon,
  Mail,
  Lock,
  Calendar,
  Shield,
  Wallet,
  PiggyBank,
  LogOut,
  Save,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { userApi } from '@/api/userApi';
import { useWalletStore } from '@/store/useWalletStore';
import { useSavingStore } from '@/store/useSavingStore';
import { useNavigate } from 'react-router-dom';

// ============================================================
// Schemas
// ============================================================
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100),
  email: z.string().email('Email không đúng định dạng'),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Mật khẩu cũ tối thiểu 6 ký tự'),
    newPassword: z.string().min(6, 'Mật khẩu mới tối thiểu 6 ký tự'),
    confirmNewPassword: z.string().min(6, 'Xác nhận mật khẩu tối thiểu 6 ký tự'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, fetchProfile } = useAuthStore();
  const { wallets, fetchWallets } = useWalletStore();
  const { summary: savingSummary, fetchSummary: fetchSavingSummary } = useSavingStore();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchWallets();
    fetchSavingSummary();
  }, [fetchProfile, fetchWallets, fetchSavingSummary]);

  // Form Cập nhật hồ sơ
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfileForm,
    formState: { errors: profileErrors },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
    },
  });

  // Cập nhật giá trị ban đầu khi profile được load
  useEffect(() => {
    if (user) {
      resetProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
      });
    }
  }, [user, resetProfileForm]);

  // Form Đổi mật khẩu
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const onUpdateProfile = async (data: UpdateProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const res = await userApi.updateProfile(data);
      if (res.success) {
        toast.success('Cập nhật thông tin hồ sơ thành công!');
        await fetchProfile();
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Cập nhật thất bại');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: ChangePasswordFormData) => {
    setIsChangingPassword(true);
    try {
      const res = await userApi.changePassword({
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
      });
      if (res.success) {
        toast.success('Đổi mật khẩu thành công!');
        resetPasswordForm();
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string }).message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = (user?.fullName || user?.userName || 'U').charAt(0).toUpperCase();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hồ sơ cá nhân</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Quản lý thông tin tài khoản, bảo mật và các thiết lập cá nhân của bạn
        </p>
      </div>

      {/* Thẻ Thông tin người dùng & Hoạt động */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar chữ cái lớn */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-slate-900 font-extrabold text-3xl flex items-center justify-center shadow-md shrink-0">
            {initial}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {user?.fullName || user?.userName || 'Người dùng'}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 w-fit mx-auto sm:mx-0">
                <CheckCircle2 size={12} /> Thành viên MyMoney
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <UserIcon size={14} className="text-slate-400" />
                @{user?.userName}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-slate-400" />
                {user?.email}
              </span>
              {user?.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3 Chỉ số tài khoản nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Wallet size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Ví tài chính</span>
              <p className="text-base font-bold text-slate-800">{wallets.length} ví</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <PiggyBank size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Quỹ tiết kiệm</span>
              <p className="text-base font-bold text-slate-800">{savingSummary?.goals.length ?? 0} mục tiêu</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Trạng thái bảo mật</span>
              <p className="text-base font-bold text-emerald-600">Đang bảo vệ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hàng 2: Form Chỉnh sửa thông tin & Form Đổi mật khẩu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột 1: Chỉnh sửa thông tin cơ bản */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserIcon size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Thông tin cơ bản</h3>
          </div>

          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Tên đăng nhập (Username)
              </label>
              <input
                type="text"
                disabled
                value={user?.userName || ''}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Tên đăng nhập không thể thay đổi</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Họ và tên
              </label>
              <input
                type="text"
                {...registerProfile('fullName')}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  profileErrors.fullName
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
              {profileErrors.fullName && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Địa chỉ Email
              </label>
              <input
                type="email"
                {...registerProfile('email')}
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  profileErrors.email
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
              {profileErrors.email && (
                <p className="mt-1 text-xs text-red-500">{profileErrors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Save size={16} />
              {isUpdatingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </form>
        </div>

        {/* Cột 2: Đổi mật khẩu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <KeyRound size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Bảo mật & Đổi mật khẩu</h3>
          </div>

          <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Mật khẩu hiện tại
              </label>
              <input
                type="password"
                {...registerPassword('oldPassword')}
                placeholder="Nhập mật khẩu cũ..."
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.oldPassword
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
              {passwordErrors.oldPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.oldPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Mật khẩu mới
              </label>
              <input
                type="password"
                {...registerPassword('newPassword')}
                placeholder="Tối thiểu 6 ký tự..."
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.newPassword
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                {...registerPassword('confirmNewPassword')}
                placeholder="Nhập lại mật khẩu mới..."
                className={`w-full rounded-xl border bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 ${
                  passwordErrors.confirmNewPassword
                    ? 'border-red-400 focus:ring-red-400/20'
                    : 'border-slate-200 focus:border-amber-400'
                }`}
              />
              {passwordErrors.confirmNewPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordErrors.confirmNewPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <Lock size={16} />
              {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        </div>
      </div>

      {/* Khu vực Đăng xuất */}
      <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-rose-800">Đăng xuất khỏi tài khoản</p>
          <p className="text-xs text-rose-600 mt-0.5">
            Phiên đăng nhập hiện tại trên trình duyệt này sẽ kết thúc
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-2xs shrink-0"
        >
          <LogOut size={15} />
          Đăng xuất ngay
        </button>
      </div>
    </div>
  );
}
