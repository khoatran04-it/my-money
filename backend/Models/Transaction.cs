using backend.Enums;

namespace backend.Models
{
    /// <summary>
    /// Thực thể Transaction đại diện cho một giao dịch thu hoặc chi trong hệ thống.
    /// </summary>
    public class Transaction
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string WalletId { get; set; }
        public required string CategoryId { get; set; }

        /// <summary>
        /// Số tiền giao dịch (luôn là số dương, phân loại thu/chi qua thuộc tính Type).
        /// </summary>
        public decimal Amount { get; set; }

        /// <summary>
        /// Loại giao dịch: Income (Thu) hoặc Expense (Chi).
        /// </summary>
        public TransactionType Type { get; set; }

        /// <summary>
        /// Ngày diễn ra giao dịch thực tế do người dùng chọn.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Ghi chú / mô tả cho giao dịch.
        /// </summary>
        public string? Note { get; set; }

        /// <summary>
        /// Thời điểm bản ghi được tạo trong hệ thống.
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Wallet? Wallet { get; set; }
        public Category? Category { get; set; }
    }
}
