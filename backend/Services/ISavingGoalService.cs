using backend.DTOs.SavingGoal;

namespace backend.Services
{
    public interface ISavingGoalService
    {
        /// <summary>
        /// Lấy danh sách và tổng quan các mục tiêu tích lũy của người dùng.
        /// </summary>
        Task<SavingGoalSummaryDto> GetSummaryAsync(string userId);

        /// <summary>
        /// Lấy chi tiết một mục tiêu tích lũy theo Id.
        /// </summary>
        Task<SavingGoalReadDto?> GetByIdAsync(string id, string userId);

        /// <summary>
        /// Tạo mới một mục tiêu tích lũy.
        /// </summary>
        Task<SavingGoalReadDto> CreateAsync(string userId, SavingGoalCreateDto dto);

        /// <summary>
        /// Cập nhật thông tin mục tiêu tích lũy (Tên, Hạn mức mục tiêu, Hạn chót, Màu sắc, Icon).
        /// </summary>
        Task<SavingGoalReadDto?> UpdateAsync(string id, string userId, SavingGoalUpdateDto dto);

        /// <summary>
        /// Xóa mục tiêu tích lũy (tiền trong quỹ tự động được giải phóng về số dư khả dụng của ví).
        /// </summary>
        Task DeleteAsync(string id, string userId);

        /// <summary>
        /// Nạp thêm tiền vào quỹ tiết kiệm từ số dư khả dụng của ví liên kết.
        /// </summary>
        Task<SavingGoalReadDto?> DepositAsync(string id, string userId, SavingGoalDepositDto dto);

        /// <summary>
        /// Rút tiền từ quỹ tiết kiệm hoàn trả lại số dư khả dụng cho ví liên kết.
        /// </summary>
        Task<SavingGoalReadDto?> WithdrawAsync(string id, string userId, SavingGoalWithdrawDto dto);
    }
}
