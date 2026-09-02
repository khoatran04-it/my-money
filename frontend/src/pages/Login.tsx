import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserLoginDto } from '@/types/auth.types';

const loginSchema = z.object({
  userName: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export default function Login() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserLoginDto>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: UserLoginDto) => {
    try {
      await login(data);
      toast.success('Đăng nhập thành công!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMsg = (err as { message?: string }).message || 'Đăng nhập thất bại';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Đăng nhập</h2>
        <p className="text-sm text-slate-500 mt-1">
          Mời bạn nhập thông tin để truy cập tài khoản
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Tên đăng nhập
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
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          {errors.userName && (
            <p className="mt-1 text-xs font-medium text-red-500">
              {errors.userName.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Mật khẩu
            </label>
            <a href="#" className="text-xs font-medium text-amber-600 hover:underline">
              Quên mật khẩu?
            </a>
          </div>
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
            <span>Đang xử lý...</span>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-amber-600 hover:text-amber-700 hover:underline"
          >
            Đăng ký tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
}