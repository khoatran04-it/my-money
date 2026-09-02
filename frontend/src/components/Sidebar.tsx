import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Coins,
  LayoutDashboard,
  Wallet,
  FolderTree,
  PieChart,
  User,
  type LucideIcon,
} from 'lucide-react';

// 1. CẤU HÌNH MENU
interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path?: string;
  children?: { label: string; path: string }[];
}

const MENU_CONFIG: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Tổng quan',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    id: 'transactions',
    label: 'Giao dịch & Ví',
    icon: Wallet,
    children: [
      { label: 'Sổ giao dịch', path: '/transactions' },
      { label: 'Danh sách Ví & Tài khoản', path: '/wallets' },
    ],
  },
  {
    id: 'categories-budgets',
    label: 'Danh mục & Ngân sách',
    icon: FolderTree,
    children: [
      { label: 'Danh mục Thu / Chi', path: '/categories' },
      { label: 'Hạn mức ngân sách', path: '/budgets' },
    ],
  },
  {
    id: 'reports',
    label: 'Báo cáo & Thống kê',
    icon: PieChart,
    path: '/reports',
  },
  {
    id: 'profile',
    label: 'Hồ sơ cá nhân',
    icon: User,
    path: '/profile',
  },
];

// 2. COMPONENT SIDEBAR CHÍNH
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc menu theo từ khóa tìm kiếm
  const displayMenu = useMemo(() => {
    if (!searchTerm.trim()) return MENU_CONFIG;

    const lowerTerm = searchTerm.toLowerCase();
    return MENU_CONFIG.map((menu) => {
      const matchParent = menu.label.toLowerCase().includes(lowerTerm);
      const matchedChildren = menu.children?.filter((c) =>
        c.label.toLowerCase().includes(lowerTerm)
      );

      if (matchParent || (matchedChildren && matchedChildren.length > 0)) {
        return {
          ...menu,
          children: matchParent ? menu.children : matchedChildren,
        };
      }
      return null;
    }).filter(Boolean) as MenuItem[];
  }, [searchTerm]);

  // Tự động mở menu cha nếu menu con đang được kích hoạt hoặc khi đang search
  useEffect(() => {
    if (searchTerm) {
      setOpenMenus(displayMenu.map((m) => m.id));
    } else {
      const activeParent = displayMenu.find((m) =>
        m.children?.some((c) => location.pathname.startsWith(c.path))
      );
      if (activeParent && !openMenus.includes(activeParent.id)) {
        setOpenMenus((prev) => [...prev, activeParent.id]);
      }
    }
  }, [location.pathname, searchTerm, displayMenu]);

  const toggleSubmenu = (id: string) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-surface border-r border-slate-200 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* LOGO */}
      <div
        className={`h-16 flex items-center shrink-0 border-b border-slate-100 transition-all duration-300 ${
          isCollapsed ? 'justify-center' : 'px-6'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl flex items-center justify-center shrink-0 shadow-sm hover:scale-105 transition-transform">
            <Coins size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg tracking-wide text-content whitespace-nowrap overflow-hidden">
              MyMoney
            </span>
          )}
        </div>
      </div>

      {/* NÚT TẮT / MỞ SIDEBAR */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-surface border border-slate-200 rounded-full p-1 text-content-muted hover:text-primary hover:border-primary shadow-sm cursor-pointer z-50 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* THANH TÌM KIẾM */}
      {!isCollapsed && (
        <div className="px-4 py-3 shrink-0">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3 text-content-muted" />
            <input
              type="text"
              placeholder="Tìm nhanh tính năng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-content focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-content-muted"
            />
          </div>
        </div>
      )}

      {/* DANH SÁCH MENU */}
      <nav
        className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 ${
          isCollapsed ? 'py-4 px-3' : 'px-3 pb-4'
        }`}
      >
        {displayMenu.map((item) => {
          const Icon = item.icon;
          const isOpen = openMenus.includes(item.id);
          const isChildActive = item.children?.some((c) =>
            location.pathname.startsWith(c.path)
          );
          const isActive =
            (item.path && location.pathname === item.path) || isChildActive;

          return (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() =>
                  item.children ? toggleSubmenu(item.id) : navigate(item.path!)
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors group ${
                  isActive
                    ? 'bg-amber-50 text-primary font-semibold'
                    : 'text-content-muted hover:bg-slate-50 hover:text-content font-medium'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon
                    size={20}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-primary' : 'text-slate-400 group-hover:text-content'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm whitespace-nowrap truncate">
                      {item.label}
                    </span>
                  )}
                </div>

                {item.children && !isCollapsed && (
                  <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-primary' : 'text-slate-400'
                    }`}
                  />
                )}
              </button>

              {/* SUBMENU */}
              {item.children && !isCollapsed && (
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? 'grid-rows-[1fr] opacity-100 mt-1'
                      : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden flex flex-col gap-1 relative">
                    <div className="absolute left-5 top-0 bottom-2 w-px bg-slate-200" />
                    {item.children.map((child) => {
                      const isSubActive = location.pathname.startsWith(
                        child.path
                      );
                      return (
                        <button
                          key={child.path}
                          onClick={() => navigate(child.path)}
                          className={`relative w-full flex items-center py-2 pl-11 pr-3 rounded-lg text-xs transition-all ${
                            isSubActive
                              ? 'text-primary font-semibold bg-amber-50/60'
                              : 'text-content-muted hover:text-content hover:bg-slate-50'
                          }`}
                        >
                          {isSubActive && (
                            <div className="absolute left-4.5 w-1.5 h-1.5 rounded-full bg-primary ring-4 ring-surface" />
                          )}
                          <span className="truncate text-left flex-1">
                            {child.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {displayMenu.length === 0 && searchTerm && (
          <div className="text-center py-8 px-2 text-content-muted text-xs">
            Không tìm thấy "{searchTerm}"
          </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;