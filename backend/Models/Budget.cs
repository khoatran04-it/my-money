namespace backend.Models
{
    /// <summary>
    /// Thực thể Budget đại diện cho hạn mức ngân sách chi tiêu của người dùng theo danh mục trong một tháng/năm cụ thể.
    /// </summary>
    public class Budget
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string CategoryId { get; set; }

        /// <summary>
        /// Số tiền hạn mức chi tiêu tối đa đặt ra cho danh mục này.
        /// </summary>
        public decimal LimitAmount { get; set; }

        /// <summary>
        /// Tháng áp dụng hạn mức (1 - 12).
        /// </summary>
        public int Month { get; set; }

        /// <summary>
        /// Năm áp dụng hạn mức (ví dụ: 2026).
        /// </summary>
        public int Year { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? User { get; set; }
        public Category? Category { get; set; }
    }
}
