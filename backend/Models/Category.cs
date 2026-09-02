using backend.Enums;

namespace backend.Models
{
    /// <summary>
    /// Danh mục thu / chi. UserId = null nghĩa là danh mục mặc định của hệ thống (dùng chung cho mọi user).
    /// </summary>
    public class Category
    {
        public required string Id { get; set; }

        /// <summary>
        /// Null = danh mục mặc định hệ thống, có UserId = danh mục riêng của user đó.
        /// </summary>
        public string? UserId { get; set; }

        public required string Name { get; set; }

        /// <summary>
        /// Loại danh mục: Income (Thu) hoặc Expense (Chi).
        /// Lưu dưới dạng string trong DB (VD: "Income", "Expense").
        /// </summary>
        public TransactionType Type { get; set; }

        /// <summary>
        /// Tên icon lucide-react (VD: "shopping-cart", "utensils", "car").
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// Màu hex hiển thị (VD: "#EF4444").
        /// </summary>
        public string? Color { get; set; }

        /// <summary>
        /// Đánh dấu đây là danh mục mặc định hệ thống (seed data).
        /// </summary>
        public bool IsDefault { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }
}
