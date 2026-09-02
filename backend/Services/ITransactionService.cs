using backend.Common;
using backend.DTOs.Transaction;

namespace backend.Services
{
    public interface ITransactionService
    {
        /// <summary>
        /// Lấy danh sách giao dịch của người dùng với bộ lọc và phân trang.
        /// </summary>
        Task<PagedResult<TransactionReadDto>> GetPagedAsync(string userId, TransactionFilterDto filter);

        /// <summary>
        /// Lấy chi tiết một giao dịch theo Id.
        /// </summary>
        Task<TransactionReadDto?> GetByIdAsync(string transactionId, string userId);

        /// <summary>
        /// Tạo mới một giao dịch và tự động cập nhật số dư ví.
        /// </summary>
        Task<TransactionReadDto> CreateAsync(string userId, TransactionCreateDto dto);

        /// <summary>
        /// Cập nhật thông tin giao dịch và điều chỉnh lại số dư ví phù hợp.
        /// </summary>
        Task<TransactionReadDto?> UpdateAsync(string transactionId, string userId, TransactionUpdateDto dto);

        /// <summary>
        /// Xóa giao dịch và hoàn tác lại số dư ví.
        /// </summary>
        Task DeleteAsync(string transactionId, string userId);
    }
}
