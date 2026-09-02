namespace backend.DTOs.Budget
{
    /// <summary>
    /// DTO tạo mới hạn mức ngân sách.
    /// </summary>
    public class BudgetCreateDto
    {
        public required string CategoryId { get; set; }
        public decimal LimitAmount { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    /// <summary>
    /// DTO cập nhật hạn mức ngân sách.
    /// </summary>
    public class BudgetUpdateDto
    {
        public decimal LimitAmount { get; set; }
    }

    /// <summary>
    /// DTO đọc thông tin ngân sách chi tiết, bao gồm tiến độ chi tiêu thực tế.
    /// </summary>
    public class BudgetReadDto
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }

        public required string CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryIcon { get; set; }
        public string? CategoryColor { get; set; }

        public decimal LimitAmount { get; set; }
        public decimal SpentAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public double Percentage { get; set; }
        public bool IsOverBudget { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO tóm tắt tổng quan ngân sách cho một tháng/năm.
    /// </summary>
    public class BudgetSummaryDto
    {
        public decimal TotalLimit { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalRemaining { get; set; }
        public double OverallPercentage { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public List<BudgetReadDto> Budgets { get; set; } = new();
    }
}
