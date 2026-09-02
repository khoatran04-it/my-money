import { Outlet } from 'react-router-dom';
import { Coins, TrendingUp, ShieldCheck, Wallet } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Cột trái: Branding & Quảng bá (Chỉ hiện trên màn hình lớn) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white relative overflow-hidden flex-col justify-between p-12">
        {/* Họa tiết trang trí nền */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-amber-400 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
            <Coins className="h-6 w-6 text-slate-900" />
          </div>
          <span className="text-2xl font-black tracking-wider text-white">
            MyMoney
          </span>
        </div>

        {/* Nội dung điểm nhấn */}
        <div className="relative z-10 space-y-8 my-auto max-w-lg">
          <div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight mb-4 text-slate-100">
              Quản lý tài chính cá nhân <br />
              <span className="text-amber-400">thông minh & tối ưu</span>
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Theo dõi dòng tiền, quản lý danh mục chi tiêu và xây dựng kế hoạch tiết kiệm dài hạn chỉ trên một nền tảng duy nhất.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Thống kê trực quan</h4>
                <p className="text-xs text-slate-400">Biểu đồ phân tích thu chi rõ ràng theo từng tháng.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">Quản lý đa ví</h4>
                <p className="text-xs text-slate-400">Theo dõi số dư ngân hàng, tiền mặt và các khoản đầu tư.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 backdrop-blur-sm">
              <div className="p-2 rounded-lg bg-amber-400/10 text-amber-400 shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">An toàn & Bảo mật</h4>
                <p className="text-xs text-slate-400">Dữ liệu tài chính luôn được mã hóa và bảo vệ tuyệt đối.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} MyMoney App. All rights reserved.
        </div>
      </div>

      {/* Cột phải: Form Đăng nhập / Đăng ký */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Logo hiển thị trên màn hình Mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
            <div className="bg-amber-400 p-2 rounded-xl">
              <Coins className="h-6 w-6 text-slate-900" />
            </div>
            <span className="text-2xl font-black tracking-wider text-slate-800">
              MyMoney
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}