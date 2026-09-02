using backend.Enums;

namespace backend.DTOs.Category
{
    /// <summary>
    /// DTO tạo danh mục mới.
    /// </summary>
    public class CategoryCreateDto
    {
        public required string Name { get; set; }
        public TransactionType Type { get; set; } = TransactionType.Expense;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }

    /// <summary>
    /// DTO đọc thông tin danh mục.
    /// </summary>
    public class CategoryReadDto
    {
        public required string Id { get; set; }
        public string? UserId { get; set; }
        public required string Name { get; set; }
        public TransactionType Type { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public bool IsDefault { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    /// <summary>
    /// DTO cập nhật thông tin danh mục.
    /// </summary>
    public class CategoryUpdateDto
    {
        public string? Name { get; set; }
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}
