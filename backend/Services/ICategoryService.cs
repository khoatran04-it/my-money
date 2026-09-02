using backend.DTOs.Category;
using backend.Enums;

namespace backend.Services
{
    public interface ICategoryService
    {
        /// <summary>
        /// Lấy danh sách danh mục (gồm danh mục mặc định của hệ thống và danh mục của user).
        /// Có thể lọc theo loại (Income / Expense).
        /// </summary>
        Task<List<CategoryReadDto>> GetAllAsync(string userId, TransactionType? type = null);

        /// <summary>
        /// Lấy chi tiết một danh mục theo Id.
        /// </summary>
        Task<CategoryReadDto?> GetByIdAsync(string categoryId, string userId);

        /// <summary>
        /// Tạo danh mục mới cho người dùng.
        /// </summary>
        Task<CategoryReadDto> CreateAsync(string userId, CategoryCreateDto dto);

        /// <summary>
        /// Cập nhật danh mục riêng của người dùng (không được sửa danh mục hệ thống).
        /// </summary>
        Task<CategoryReadDto?> UpdateAsync(string categoryId, string userId, CategoryUpdateDto dto);

        /// <summary>
        /// Xóa danh mục riêng của người dùng (không được xóa danh mục hệ thống).
        /// </summary>
        Task DeleteAsync(string categoryId, string userId);
    }
}
