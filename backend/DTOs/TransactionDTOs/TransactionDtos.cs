using backend.Enums;

namespace backend.DTOs.Transaction
{
    /// <summary>
    /// DTO tạo giao dịch mới.
    /// </summary>
    public class TransactionCreateDto
    {
        public required string WalletId { get; set; }
        public required string CategoryId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO cập nhật giao dịch.
    /// </summary>
    public class TransactionUpdateDto
    {
        public required string WalletId { get; set; }
        public required string CategoryId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public DateTime Date { get; set; }
        public string? Note { get; set; }
    }

    /// <summary>
    /// DTO đọc thông tin giao dịch trả về cho client.
    /// </summary>
    public class TransactionReadDto
    {
        public required string Id { get; set; }
        public required string UserId { get; set; }

        public required string WalletId { get; set; }
        public string? WalletName { get; set; }

        public required string CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryIcon { get; set; }
        public string? CategoryColor { get; set; }

        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public DateTime Date { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO chứa các tham số lọc và phân trang cho danh sách giao dịch.
    /// </summary>
    public class TransactionFilterDto
    {
        public string? WalletId { get; set; }
        public string? CategoryId { get; set; }
        public TransactionType? Type { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Search { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
