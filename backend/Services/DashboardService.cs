using AutoMapper;
using backend.Data;
using backend.DTOs.Dashboard;
using backend.DTOs.Transaction;
using backend.Enums;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IBudgetService _budgetService;
        private readonly ISavingGoalService _savingGoalService;

        public DashboardService(
            MyMoneyDbContext context,
            IMapper mapper,
            IBudgetService budgetService,
            ISavingGoalService savingGoalService)
        {
            _context = context;
            _mapper = mapper;
            _budgetService = budgetService;
            _savingGoalService = savingGoalService;
        }

        public async Task<DashboardOverviewDto> GetOverviewAsync(string userId, DashboardFilterDto filter)
        {
            var now = DateTime.UtcNow;
            var targetMonth = filter.Month ?? now.Month;
            var targetYear = filter.Year ?? now.Year;

            // 1. Phân tích tài sản theo các Ví
            var wallets = await _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.IsDefault)
                .ThenBy(w => w.CreatedAt)
                .ToListAsync();

            var savingsMap = await _context.SavingGoals
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.Status == "Active")
                .GroupBy(s => s.WalletId)
                .Select(g => new { WalletId = g.Key, Total = g.Sum(s => s.CurrentAmount) })
                .ToDictionaryAsync(x => x.WalletId, x => x.Total);

            var totalBalance = wallets.Sum(w => w.Balance);
            var totalSavings = savingsMap.Values.Sum();
            var totalAvailableBalance = totalBalance - totalSavings;

            var walletDistribution = wallets.Select(w =>
            {
                var reserved = savingsMap.GetValueOrDefault(w.Id, 0m);
                return new WalletDistributionDto
                {
                    WalletId = w.Id,
                    WalletName = w.Name,
                    Type = w.Type,
                    Color = w.Color,
                    Balance = w.Balance,
                    AvailableBalance = w.Balance - reserved,
                    Percentage = totalBalance > 0
                        ? Math.Round((double)(w.Balance / totalBalance) * 100, 1)
                        : 0,
                };
            }).ToList();

            // 2. Phân tích giao dịch trong tháng được chọn
            var monthTransQuery = _context.Transactions
                .AsNoTracking()
                .Include(t => t.Category)
                .Where(t => t.UserId == userId
                            && t.Date.Month == targetMonth
                            && t.Date.Year == targetYear);

            if (!string.IsNullOrEmpty(filter.WalletId))
            {
                monthTransQuery = monthTransQuery.Where(t => t.WalletId == filter.WalletId);
            }

            var monthTransactions = await monthTransQuery.ToListAsync();

            var monthlyIncome = monthTransactions
                .Where(t => t.Type == TransactionType.Income)
                .Sum(t => t.Amount);

            var monthlyExpense = monthTransactions
                .Where(t => t.Type == TransactionType.Expense)
                .Sum(t => t.Amount);

            // 3. Cơ cấu chi tiêu theo Danh mục
            var expenseBreakdown = monthTransactions
                .Where(t => t.Type == TransactionType.Expense)
                .GroupBy(t => new { t.CategoryId, Name = t.Category != null ? t.Category.Name : "Khác", Color = t.Category != null ? t.Category.Color : null, Icon = t.Category != null ? t.Category.Icon : null })
                .Select(g => new CategoryBreakdownDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    Color = g.Key.Color ?? "#64748B",
                    Icon = g.Key.Icon,
                    Amount = g.Sum(t => t.Amount),
                    Percentage = monthlyExpense > 0
                        ? Math.Round((double)(g.Sum(t => t.Amount) / monthlyExpense) * 100, 1)
                        : 0,
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            // 4. Cơ cấu thu nhập theo Danh mục
            var incomeBreakdown = monthTransactions
                .Where(t => t.Type == TransactionType.Income)
                .GroupBy(t => new { t.CategoryId, Name = t.Category != null ? t.Category.Name : "Khác", Color = t.Category != null ? t.Category.Color : null, Icon = t.Category != null ? t.Category.Icon : null })
                .Select(g => new CategoryBreakdownDto
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.Name,
                    Color = g.Key.Color ?? "#10B981",
                    Icon = g.Key.Icon,
                    Amount = g.Sum(t => t.Amount),
                    Percentage = monthlyIncome > 0
                        ? Math.Round((double)(g.Sum(t => t.Amount) / monthlyIncome) * 100, 1)
                        : 0,
                })
                .OrderByDescending(c => c.Amount)
                .ToList();

            // 5. Xu hướng 12 tháng trong năm (Monthly Trends)
            var yearTransQuery = _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId && t.Date.Year == targetYear);

            if (!string.IsNullOrEmpty(filter.WalletId))
            {
                yearTransQuery = yearTransQuery.Where(t => t.WalletId == filter.WalletId);
            }

            var yearTransactions = await yearTransQuery.ToListAsync();

            var monthlyTrends = new List<MonthlyTrendDto>();
            for (int m = 1; m <= 12; m++)
            {
                var transInMonth = yearTransactions.Where(t => t.Date.Month == m).ToList();
                var inc = transInMonth.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount);
                var exp = transInMonth.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount);

                monthlyTrends.Add(new MonthlyTrendDto
                {
                    Month = m,
                    MonthName = $"T{m}",
                    Income = inc,
                    Expense = exp,
                });
            }

            // 6. Cảnh báo Ngân sách trong tháng (ưu tiên những mục tiêu >= 70% hoặc vượt mức)
            var budgetSummary = await _budgetService.GetSummaryAsync(userId, targetMonth, targetYear);
            var budgetAlerts = budgetSummary.Budgets
                .Where(b => b.Percentage >= 70 || b.IsOverBudget)
                .OrderByDescending(b => b.IsOverBudget)
                .ThenByDescending(b => b.Percentage)
                .Take(5)
                .ToList();

            // Nếu không có mục tiêu nào cảnh báo thì lấy top ngân sách lớn nhất
            if (budgetAlerts.Count == 0 && budgetSummary.Budgets.Count > 0)
            {
                budgetAlerts = budgetSummary.Budgets.Take(3).ToList();
            }

            // 7. Mục tiêu tích lũy (Saving Goals)
            var savingSummary = await _savingGoalService.GetSummaryAsync(userId);
            var savingGoals = savingSummary.Goals
                .OrderBy(g => g.IsCompleted)
                .ThenByDescending(g => g.Percentage)
                .Take(4)
                .ToList();

            // 8. Các giao dịch mới nhất (Recent Transactions)
            var recentQuery = _context.Transactions
                .AsNoTracking()
                .Include(t => t.Wallet)
                .Include(t => t.Category)
                .Where(t => t.UserId == userId);

            if (!string.IsNullOrEmpty(filter.WalletId))
            {
                recentQuery = recentQuery.Where(t => t.WalletId == filter.WalletId);
            }

            var recentTransactions = await recentQuery
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .Take(6)
                .ToListAsync();

            var recentDtos = _mapper.Map<List<TransactionReadDto>>(recentTransactions);

            return new DashboardOverviewDto
            {
                TotalBalance = totalBalance,
                TotalAvailableBalance = totalAvailableBalance,
                TotalSavings = totalSavings,
                Month = targetMonth,
                Year = targetYear,
                MonthlyIncome = monthlyIncome,
                MonthlyExpense = monthlyExpense,
                MonthlyTrends = monthlyTrends,
                ExpenseBreakdown = expenseBreakdown,
                IncomeBreakdown = incomeBreakdown,
                WalletDistribution = walletDistribution,
                BudgetAlerts = budgetAlerts,
                SavingGoals = savingGoals,
                RecentTransactions = recentDtos,
            };
        }
    }
}
