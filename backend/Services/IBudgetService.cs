using backend.DTOs.Budget;

namespace backend.Services
{
    public interface IBudgetService
    {
        /// <summary>
        /// Lấy tổng quan ngân sách và tiến độ chi tiêu thực tế trong tháng/năm của người dùng.
        /// </summary>
        Task<BudgetSummaryDto> GetSummaryAsync(string userId, int month, int year);

        /// <summary>
        /// Lấy thông tin chi tiết một ngân sách theo Id.
        /// </summary>
        Task<BudgetReadDto?> GetByIdAsync(string budgetId, string userId);

        /// <summary>
        /// Tạo mới một hạn mức ngân sách cho danh mục chi tiêu.
        /// </summary>
        Task<BudgetReadDto> CreateAsync(string userId, BudgetCreateDto dto);

        /// <summary>
        /// Cập nhật hạn mức số tiền của ngân sách.
        /// </summary>
        Task<BudgetReadDto?> UpdateAsync(string budgetId, string userId, BudgetUpdateDto dto);

        /// <summary>
        /// Xóa ngân sách.
        /// </summary>
        Task DeleteAsync(string budgetId, string userId);
    }
}
