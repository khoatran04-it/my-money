using backend.DTOs.Budget;
using backend.DTOs.SavingGoal;
using backend.DTOs.Transaction;

namespace backend.DTOs.Dashboard
{
    /// <summary>
    /// Bộ lọc thời gian và ví cho Dashboard.
    /// </summary>
    public class DashboardFilterDto
    {
        public int? Month { get; set; }
        public int? Year { get; set; }
        public string? WalletId { get; set; }
    }

    /// <summary>
    /// Xu hướng thu chi theo từng tháng trong năm.
    /// </summary>
    public class MonthlyTrendDto
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public decimal Income { get; set; }
        public decimal Expense { get; set; }
        public decimal Net => Income - Expense;
    }

    /// <summary>
    /// Phân bổ chi tiêu hoặc thu nhập theo danh mục.
    /// </summary>
    public class CategoryBreakdownDto
    {
        public string CategoryId { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public decimal Amount { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// Cơ cấu phân bổ tiền trong các ví.
    /// </summary>
    public class WalletDistributionDto
    {
        public string WalletId { get; set; } = string.Empty;
        public string WalletName { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Color { get; set; }
        public decimal Balance { get; set; }
        public decimal AvailableBalance { get; set; }
        public double Percentage { get; set; }
    }

    /// <summary>
    /// DTO tổng hợp toàn bộ dữ liệu thống kê, báo cáo và chỉ số tài chính cho Dashboard.
    /// </summary>
    public class DashboardOverviewDto
    {
        // 1. Chỉ số tổng quan tài sản
        public decimal TotalBalance { get; set; }
        public decimal TotalAvailableBalance { get; set; }
        public decimal TotalSavings { get; set; }

        // 2. Chỉ số trong kỳ (Tháng/Năm)
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal MonthlyIncome { get; set; }
        public decimal MonthlyExpense { get; set; }
        public decimal NetCashflow => MonthlyIncome - MonthlyExpense;
        public double SavingsRate => MonthlyIncome > 0
            ? Math.Round((double)((MonthlyIncome - MonthlyExpense) / MonthlyIncome) * 100, 1)
            : 0;

        // 3. Xu hướng 12 tháng gần nhất hoặc trong năm
        public List<MonthlyTrendDto> MonthlyTrends { get; set; } = new();

        // 4. Cơ cấu danh mục chi tiêu & thu nhập
        public List<CategoryBreakdownDto> ExpenseBreakdown { get; set; } = new();
        public List<CategoryBreakdownDto> IncomeBreakdown { get; set; } = new();

        // 5. Cơ cấu phân bổ theo Ví
        public List<WalletDistributionDto> WalletDistribution { get; set; } = new();

        // 6. Cảnh báo Ngân sách trong tháng
        public List<BudgetReadDto> BudgetAlerts { get; set; } = new();

        // 7. Mục tiêu tích lũy nổi bật
        public List<SavingGoalReadDto> SavingGoals { get; set; } = new();

        // 8. Các giao dịch gần đây nhất
        public List<TransactionReadDto> RecentTransactions { get; set; } = new();
    }
}
