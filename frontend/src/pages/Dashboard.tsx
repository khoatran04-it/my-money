import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  BarChart3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Tag,
  ReceiptText,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import { useWalletStore } from '@/store/useWalletStore';
import { Dropdown } from '@/components/ui/Dropdown';

// ============================================================
// Helpers & Formatters
// ============================================================
function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatCompactNumber(amount: number) {
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1) + ' tỷ';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1) + ' tr';
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + ' k';
  }
  return amount.toString();
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

// Custom Tooltip cho Biểu đồ Cột Xu hướng
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 border border-slate-700">
        <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Tooltip cho Biểu đồ Tròn
const CustomPieTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs border border-slate-700 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
          {data.name}
        </p>
        <p className="text-amber-400 font-bold text-sm">{formatCurrency(data.value)}</p>
      </div>
    );
  }
  return null;
};

// ============================================================
// Trang Dashboard Chính
// ============================================================
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { overview, filter, isLoading, fetchOverview, setFilter } = useDashboardStore();
  const { wallets, fetchWallets } = useWalletStore();

  const [pieMode, setPieMode] = useState<'Expense' | 'Income'>('Expense');

  useEffect(() => {
    fetchOverview();
    fetchWallets();
  }, [fetchOverview, fetchWallets]);

  const handlePrevMonth = () => {
    const currentMonth = filter.month ?? new Date().getMonth() + 1;
    const currentYear = filter.year ?? new Date().getFullYear();
    if (currentMonth === 1) {
      setFilter({ month: 12, year: currentYear - 1 });
    } else {
      setFilter({ month: currentMonth - 1, year: currentYear });
    }
  };

  const handleNextMonth = () => {
    const currentMonth = filter.month ?? new Date().getMonth() + 1;
    const currentYear = filter.year ?? new Date().getFullYear();
    if (currentMonth === 12) {
      setFilter({ month: 1, year: currentYear + 1 });
    } else {
      setFilter({ month: currentMonth + 1, year: currentYear });
    }
  };

  const currentMonth = filter.month ?? new Date().getMonth() + 1;
  const currentYear = filter.year ?? new Date().getFullYear();

  // Dữ liệu cho Biểu đồ Tròn
  const pieData = useMemo(() => {
    if (!overview) return [];
    const source = pieMode === 'Expense' ? overview.expenseBreakdown : overview.incomeBreakdown;
    return source.map((item) => ({
      name: item.categoryName,
      value: item.amount,
      color: item.color || (pieMode === 'Expense' ? '#EF4444' : '#10B981'),
      percentage: item.percentage,
    }));
  }, [overview, pieMode]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Điều Khiển */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()},{' '}
            <span className="text-amber-500">{user?.fullName || user?.userName || 'Bạn'}</span>! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Báo cáo tài chính & Tình hình sức khỏe dòng tiền của bạn
          </p>
        </div>

        {/* Bộ lọc Tháng / Năm & Ví */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc theo ví */}
          <div className="w-40">
            <Dropdown
              value={filter.walletId ?? 'ALL'}
              onValueChange={(val) => setFilter({ walletId: val === 'ALL' ? undefined : val })}
              options={[
                { label: 'Tất cả các ví', value: 'ALL' },
                ...wallets.map((w) => ({ label: w.name, value: w.id })),
              ]}
            />
          </div>

          {/* Điều hướng tháng */}
          <div className="flex items-center bg-white border border-slate-200/80 rounded-xl shadow-2xs p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 select-none">
              Tháng {currentMonth} / {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Hàng 1: Bốn Thẻ Chỉ Số Tài Chính Chính (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tổng tài sản & Khả dụng */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-5 text-slate-950 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between opacity-85">
              <span className="text-xs font-bold uppercase tracking-wider">Tổng tài sản thực tế</span>
              <Wallet size={18} />
            </div>
            <p className="text-2xl font-black mt-2">
              {formatCurrency(overview?.totalBalance ?? 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900/10 flex items-center justify-between text-xs font-medium">
            <span>Khả dụng chi tiêu:</span>
            <span className="font-bold">
              {formatCurrency(overview?.totalAvailableBalance ?? 0)}
            </span>
          </div>
        </div>

        {/* Thẻ 2: Thu nhập trong tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Thu nhập tháng {currentMonth}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-2">
              +{formatCurrency(overview?.monthlyIncome ?? 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tích lũy trong kỳ:</span>
            <span className="font-semibold text-slate-700">
              {formatCurrency(overview?.totalSavings ?? 0)}
            </span>
          </div>
        </div>

        {/* Thẻ 3: Chi tiêu trong tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Chi tiêu tháng {currentMonth}
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600 mt-2">
              -{formatCurrency(overview?.monthlyExpense ?? 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Số danh mục chi:</span>
            <span className="font-semibold text-slate-700">
              {overview?.expenseBreakdown.length ?? 0} nhóm
            </span>
          </div>
        </div>

        {/* Thẻ 4: Dòng tiền ròng & Tỷ lệ tiết kiệm */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Dòng tiền ròng (Net)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PiggyBank size={18} />
              </div>
            </div>
            <p
              className={`text-2xl font-bold mt-2 ${
                (overview?.netCashflow ?? 0) >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {(overview?.netCashflow ?? 0) >= 0 ? '+' : ''}
              {formatCurrency(overview?.netCashflow ?? 0)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tỷ lệ giữ lại:</span>
            <span
              className={`font-bold ${
                (overview?.savingsRate ?? 0) >= 20 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {overview?.savingsRate ?? 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Hàng 2: Hai Biểu Đồ Trực Quan (Xu hướng & Cơ cấu danh mục) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ Cột Xu hướng 12 tháng (Chiếm 2 cột) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-500" />
              <h2 className="text-base font-bold text-slate-800">
                Xu hướng Thu nhập & Chi tiêu năm {currentYear}
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">12 tháng</span>
          </div>

          <div className="h-72 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Đang tải dữ liệu biểu đồ...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overview?.monthlyTrends ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="monthName" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => formatCompactNumber(val)}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  <Bar dataKey="income" name="Thu nhập" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="expense" name="Chi tiêu" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Biểu đồ Tròn Cơ cấu Thu/Chi (Chiếm 1 cột) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <PieIcon size={18} className="text-amber-500" />
                <h2 className="text-base font-bold text-slate-800">Cơ cấu danh mục</h2>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPieMode('Expense')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    pieMode === 'Expense' ? 'bg-white text-rose-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Chi tiêu
                </button>
                <button
                  onClick={() => setPieMode('Income')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    pieMode === 'Income' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Thu nhập
                </button>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="h-52 w-full flex items-center justify-center relative">
              {pieData.length === 0 ? (
                <div className="text-center text-xs text-slate-400">
                  Chưa có giao dịch {pieMode === 'Expense' ? 'chi tiêu' : 'thu nhập'} trong tháng này
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Legend danh sách 3 nhóm cao nhất */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {pieData.slice(0, 3).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[160px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{formatCompactNumber(item.value)}</span>
                  <span className="text-[11px] text-slate-400 font-semibold w-9 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hàng 3: Chi tiết Ngân sách & Mục tiêu tích lũy & Phân bổ Ví */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1: Cảnh báo Ngân sách tháng */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">Tình trạng Ngân sách</h3>
            </div>
            <button
              onClick={() => navigate('/budgets')}
              className="text-xs text-amber-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Chi tiết <ArrowRight size={12} />
            </button>
          </div>

          {overview?.budgetAlerts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Tất cả ngân sách tháng này đều đang trong ngưỡng an toàn! 👍
            </div>
          ) : (
            <div className="space-y-3.5">
              {overview?.budgetAlerts.map((b) => (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{b.categoryName}</span>
                    <span
                      className={`font-bold ${
                        b.isOverBudget
                          ? 'text-rose-600'
                          : b.percentage > 80
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {formatCurrency(b.spentAmount)} / {formatCompactNumber(b.limitAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.isOverBudget
                          ? 'bg-rose-500'
                          : b.percentage > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột 2: Mục tiêu tích lũy (Saving Goals) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PiggyBank size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">Mục tiêu tích lũy</h3>
            </div>
            <button
              onClick={() => navigate('/savings')}
              className="text-xs text-amber-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Xem tất cả <ArrowRight size={12} />
            </button>
          </div>

          {overview?.savingGoals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa có mục tiêu tiết kiệm nào. Hãy đặt mục tiêu để bắt đầu tích lũy!
            </div>
          ) : (
            <div className="space-y-3.5">
              {overview?.savingGoals.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                      {goal.name}
                    </span>
                    <span className="text-slate-600 font-medium">
                      <b className="text-emerald-600">{formatCompactNumber(goal.currentAmount)}</b> /{' '}
                      {formatCompactNumber(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cột 3: Phân bổ tài sản trong Ví */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-800">Cơ cấu phân bổ Ví</h3>
            </div>
            <button
              onClick={() => navigate('/wallets')}
              className="text-xs text-amber-600 font-semibold hover:underline inline-flex items-center gap-0.5"
            >
              Quản lý <ArrowRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {overview?.walletDistribution.map((w) => (
              <div key={w.walletId} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate max-w-[140px]">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: w.color || '#3B82F6' }} />
                  <span className="truncate text-slate-700 font-medium">{w.walletName}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800 block">{formatCurrency(w.balance)}</span>
                  <span className="text-[10px] text-slate-400">Khả dụng: {formatCompactNumber(w.availableBalance)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hàng 4: Giao dịch gần đây (Recent Transactions) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ReceiptText size={18} className="text-amber-500" />
            <h3 className="text-base font-bold text-slate-800">Giao dịch gần đây</h3>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs text-amber-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            Xem toàn bộ sổ giao dịch <ArrowRight size={13} />
          </button>
        </div>

        {overview?.recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Chưa có giao dịch nào được ghi nhận.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overview?.recentTransactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs"
                    style={{ backgroundColor: t.categoryColor || '#64748B' }}
                  >
                    <Tag size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{t.categoryName || 'Không phân loại'}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(t.date).toLocaleDateString('vi-VN')} • <span className="font-medium text-slate-500">{t.walletName}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      t.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {t.type === 'Income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </span>
                  {t.note && <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{t.note}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}