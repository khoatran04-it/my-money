import { useAuthStore } from '@/store/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-600 mt-2">
        Xin chào <span className="font-semibold text-blue-600">{user?.fullName || user?.userName}</span>, hệ thống đã sẵn sàng làm việc!
      </p>
    </div>
  );
}