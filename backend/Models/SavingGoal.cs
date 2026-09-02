namespace backend.Models
{
    /// <summary>
    /// Thực thể SavingGoal đại diện cho mục tiêu tích lũy / quỹ tiết kiệm của người dùng.
    /// Tiền trong quỹ này vẫn thuộc về Ví được liên kết, nhưng sẽ được ghi nhận là khoản tiền dành riêng
    /// giúp tính toán Số dư khả dụng (Available Balance) của Ví.
    /// </summary>
    public class SavingGoal
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string WalletId { get; set; }

        public required string Name { get; set; }

        /// <summary>
        /// Số tiền mục tiêu cần đạt được.
        /// </summary>
        public decimal TargetAmount { get; set; }

        /// <summary>
        /// Số tiền hiện tại đã để dành được trong quỹ này.
        /// </summary>
        public decimal CurrentAmount { get; set; } = 0;

        /// <summary>
        /// Ngày dự kiến hoàn thành mục tiêu.
        /// </summary>
        public DateTime? TargetDate { get; set; }

        /// <summary>
        /// Mã màu hex hiển thị.
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Tên biểu tượng lucide.
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// Trạng thái mục tiêu: Active, Completed, Cancelled.
        /// </summary>
        public string Status { get; set; } = "Active";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Wallet? Wallet { get; set; }
    }
}
