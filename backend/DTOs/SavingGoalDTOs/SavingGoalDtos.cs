namespace backend.DTOs.SavingGoal
{
    /// <summary>
    /// DTO tạo mới mục tiêu tích lũy / quỹ tiết kiệm.
    /// </summary>
    public class SavingGoalCreateDto
    {
        public required string WalletId { get; set; }
        public required string Name { get; set; }
        public decimal TargetAmount { get; set; }

        /// <summary>
        /// Số tiền nạp ban đầu vào quỹ ngay khi tạo (trích từ số dư khả dụng của ví).
        /// </summary>
        public decimal InitialDeposit { get; set; } = 0;

        public DateTime? TargetDate { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
    }

    /// <summary>
    /// DTO cập nhật thông tin mục tiêu tích lũy.
    /// </summary>
    public class SavingGoalUpdateDto
    {
        public required string Name { get; set; }
        public decimal TargetAmount { get; set; }
        public DateTime? TargetDate { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
    }

    /// <summary>
    /// DTO nạp thêm tiền vào quỹ tiết kiệm từ ví liên kết.
    /// </summary>
    public class SavingGoalDepositDto
    {
        public decimal Amount { get; set; }
    }

    /// <summary>
    /// DTO rút tiền từ quỹ tiết kiệm hoàn trả về số dư khả dụng của ví liên kết.
    /// </summary>
    public class SavingGoalWithdrawDto
    {
        public decimal Amount { get; set; }
    }

    /// <summary>
    /// DTO đọc thông tin chi tiết của mục tiêu tích lũy.
    /// </summary>
    public class SavingGoalReadDto
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }

        public required string WalletId { get; set; }
        public string? WalletName { get; set; }

        public required string Name { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public decimal RemainingAmount => Math.Max(0, TargetAmount - CurrentAmount);
        public double Percentage => TargetAmount > 0
            ? Math.Round((double)(CurrentAmount / TargetAmount) * 100, 1)
            : 0;
        public bool IsCompleted => CurrentAmount >= TargetAmount;

        public DateTime? TargetDate { get; set; }
        public string? Color { get; set; }
        public string? Icon { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO tổng quan toàn bộ các khoản tích lũy của người dùng.
    /// </summary>
    public class SavingGoalSummaryDto
    {
        public decimal TotalTarget { get; set; }
        public decimal TotalSaved { get; set; }
        public decimal TotalRemaining => Math.Max(0, TotalTarget - TotalSaved);
        public double OverallPercentage => TotalTarget > 0
            ? Math.Round((double)(TotalSaved / TotalTarget) * 100, 1)
            : 0;
        public int ActiveGoalsCount { get; set; }
        public int CompletedGoalsCount { get; set; }
        public List<SavingGoalReadDto> Goals { get; set; } = new();
    }
}
