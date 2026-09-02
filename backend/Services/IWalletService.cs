using backend.DTOs.Wallet;

namespace backend.Services
{
    public interface IWalletService
    {
        /// <summary>
        /// Lấy danh sách tất cả ví của người dùng.
        /// </summary>
        Task<List<WalletReadDto>> GetAllAsync(string userId);

        /// <summary>
        /// Lấy thông tin một ví theo Id (chỉ ví thuộc về userId).
        /// </summary>
        Task<WalletReadDto?> GetByIdAsync(string walletId, string userId);

        /// <summary>
        /// Tạo ví mới. Nếu IsDefault = true, tự động bỏ default các ví còn lại.
        /// </summary>
        Task<WalletReadDto> CreateAsync(string userId, WalletCreateDto dto);

        /// <summary>
        /// Cập nhật tên, loại, icon, màu của ví.
        /// </summary>
        Task<WalletReadDto?> UpdateAsync(string walletId, string userId, WalletUpdateDto dto);

        /// <summary>
        /// Xóa ví. Không được xóa nếu ví đang là ví duy nhất hoặc đang có giao dịch.
        /// </summary>
        Task DeleteAsync(string walletId, string userId);

        /// <summary>
        /// Đặt ví thành ví mặc định, bỏ mặc định các ví còn lại của user.
        /// </summary>
        Task<WalletReadDto?> SetDefaultAsync(string walletId, string userId);
    }
}
