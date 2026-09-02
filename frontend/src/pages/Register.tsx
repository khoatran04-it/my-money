import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Mail, UserCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserCreateDto } from '@/types/auth.types';

const registerSchema = z.object({
  userName: z.string().min(3, 'Tên đăng nhập ít nhất 3 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự trở lên'),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  avataUrl: z.string().optional(),
});

export default function Register() {
  const { register: registerAuth, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateDto>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: UserCreateDto) => {
    try {
      await registerAuth(data);
      toast.success('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string }).message || 'Đăng ký thất bại';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Tạo tài khoản</h2>
        <p className="text-sm text-slate-500 mt-1">
          Bắt đầu hành trình quản lý tài chính hiệu quả
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên đăng nhập <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <User size={18} className="absolute left-3 text-slate-400" />
            <input
              {...register('userName')}
              type="text"
              className={`w-full rounded-xl border bg-slate-50/50 pl-10 pr-3 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.userName
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="Username"
            />
          </div>
          {errors.userName && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.userName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail size={18} className="absolute left-3 text-slate-400" />
            <input
              {...register('email')}
              type="email"
              className={`w-full rounded-xl border bg-slate-50/50 pl-10 pr-3 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="example@gmail.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Họ và tên
          </label>
          <div className="relative flex items-center">
            <UserCheck size={18} className="absolute left-3 text-slate-400" />
            <input
              {...register('fullName')}
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              placeholder="Nguyễn Văn A"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <Lock size={18} className="absolute left-3 text-slate-400" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`w-full rounded-xl border bg-slate-50/50 pl-10 pr-10 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-400 focus:ring-red-400/20'
                  : 'border-slate-200 focus:border-amber-400 focus:ring-amber-400/20'
              }`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-amber-500 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <span>Đang tạo tài khoản...</span>
          ) : (
            <>
              <span>Đăng ký ngay</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-amber-600 hover:text-amber-700 hover:underline"
          >
            Quay lại Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}