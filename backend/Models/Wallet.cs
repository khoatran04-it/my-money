namespace backend.Models
{
    /// <summary>
    /// Đại diện cho một ví/tài khoản tiền của người dùng (tiền mặt, ngân hàng, thẻ...).
    /// </summary>
    public class Wallet
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string Name { get; set; }

        /// <summary>
        /// Loại ví: Cash | BankAccount | CreditCard | EWallet | Other
        /// </summary>
        public required string Type { get; set; }

        public decimal Balance { get; set; } = 0;

        /// <summary>
        /// Tên icon hiển thị (ví dụ: "wallet", "credit-card", "landmark")
        /// </summary>
        public string? Icon { get; set; }

        /// <summary>
        /// Màu hex hiển thị (ví dụ: "#3B82F6")
        /// </summary>
        public string? Color { get; set; }

        public bool IsDefault { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public User? User { get; set; }
    }
}
