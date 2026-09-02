import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* 1. Sidebar (Bên trái) */}
      <Sidebar />

      {/* 2. Khu vực bên phải (Header + Main Content) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Header ở trên cùng */}
        <Header />

        {/* Nội dung chính của các trang */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}