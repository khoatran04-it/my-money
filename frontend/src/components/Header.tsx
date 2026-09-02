import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown 
} from 'lucide-react';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Lấy chữ cái đầu của tên để làm Avatar
  const initial = (user?.fullName || user?.userName || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-30">
      {/* Cột trái: Có thể để Trống, hoặc Breadcrumb, hoặc Tiêu đề trang */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-content hidden sm:block">
          {/* Chỗ này sau này bạn có thể map với Route để hiển thị tên trang */}
        </h2>
      </div>

      {/* Cột phải: Thông báo & Profile */}
      <div className="flex items-center gap-4">
        {/* Nút Thông báo (Demo) */}
        <button className="relative p-2 text-content-muted hover:text-primary hover:bg-slate-50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-negative rounded-full border border-surface"></span>
        </button>

        {/* Vạch ngăn cách */}
        <div className="h-6 w-px bg-slate-200"></div>

        {/* Nút User Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            {/* Avatar chữ */}
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {initial}
            </div>
            
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-semibold text-content leading-none">
                {user?.fullName || user?.userName || 'Người dùng'}
              </span>
              <span className="text-[11px] text-content-muted mt-0.5">
                {user?.email || 'user@example.com'}
              </span>
            </div>

            <ChevronDown 
              size={16} 
              className={`text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Menu Dropdown xòe ra */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-slate-100 rounded-xl shadow-lg py-2 animate-in fade-in slide-in-from-top-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 mb-2 md:hidden">
                <p className="text-sm font-semibold text-content">{user?.fullName || user?.userName || 'Người dùng'}</p>
                <p className="text-xs text-content-muted">{user?.email}</p>
              </div>

              <button 
                onClick={() => { navigate('/profile'); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content hover:bg-slate-50 transition-colors"
              >
                <User size={16} className="text-slate-400" />
                Hồ sơ cá nhân
              </button>
              
              <button 
                onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-content hover:bg-slate-50 transition-colors"
              >
                <Settings size={16} className="text-slate-400" />
                Cài đặt hệ thống
              </button>
              
              <div className="h-px bg-slate-100 my-2 mx-4"></div>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-negative hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};