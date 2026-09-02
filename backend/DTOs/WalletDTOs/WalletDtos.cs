namespace backend.DTOs.Wallet
{
    /// <summary>
    /// DTO tạo ví mới.
    /// </summary>
    public class WalletCreateDto
    {
        public required string Name { get; set; }
        public required string Type { get; set; }
        public decimal Balance { get; set; } = 0;
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool IsDefault { get; set; } = false;
    }

    /// <summary>
    /// DTO đọc thông tin ví.
    /// </summary>
    public class WalletReadDto
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }
        public required string Name { get; set; }
        public required string Type { get; set; }
        public decimal Balance { get; set; }

        /// <summary>
        /// Tổng số tiền đang được phân bổ/khóa trong các mục tiêu tiết kiệm thuộc ví này.
        /// </summary>
        public decimal ReservedAmount { get; set; }

        /// <summary>
        /// Số dư khả dụng thực tế để chi tiêu = Balance - ReservedAmount.
        /// </summary>
        public decimal AvailableBalance => Balance - ReservedAmount;

        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO cập nhật thông tin ví.
    /// </summary>
    public class WalletUpdateDto
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}
