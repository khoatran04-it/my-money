using AutoMapper;
using backend.Data;
using backend.DTOs.Wallet;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class WalletService : IWalletService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;

        public WalletService(MyMoneyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách tất cả ví của người dùng, sắp xếp: ví mặc định lên đầu.
        /// </summary>
        public async Task<List<WalletReadDto>> GetAllAsync(string userId)
        {
            var wallets = await _context.Wallets
                .AsNoTracking()
                .Where(w => w.UserId == userId)
                .OrderByDescending(w => w.IsDefault)
                .ThenBy(w => w.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<WalletReadDto>>(wallets);
        }

        /// <summary>
        /// Lấy thông tin một ví theo Id, đảm bảo ví thuộc về user đang đăng nhập.
        /// </summary>
        public async Task<WalletReadDto?> GetByIdAsync(string walletId, string userId)
        {
            var wallet = await _context.Wallets
                .AsNoTracking()
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

            if (wallet == null)
                throw new NotFoundException("Ví không tồn tại hoặc bạn không có quyền truy cập.");

            return _mapper.Map<WalletReadDto>(wallet);
        }

        /// <summary>
        /// Tạo ví mới. Nếu đây là ví đầu tiên hoặc IsDefault = true,
        /// tự động bỏ cờ IsDefault của các ví khác.
        /// </summary>
        public async Task<WalletReadDto> CreateAsync(string userId, WalletCreateDto dto)
        {
            // 1. Kiểm tra tên ví không trùng trong cùng user
            var isDuplicate = await _context.Wallets
                .AnyAsync(w => w.UserId == userId && w.Name == dto.Name);

            if (isDuplicate)
                throw new BadRequestException("Tên ví đã tồn tại. Vui lòng chọn tên khác.");

            // 2. Nếu IsDefault = true hoặc đây là ví đầu tiên → bỏ default các ví khác
            var hasAnyWallet = await _context.Wallets.AnyAsync(w => w.UserId == userId);
            bool shouldBeDefault = dto.IsDefault || !hasAnyWallet;

            if (shouldBeDefault)
            {
                await ClearDefaultAsync(userId);
            }

            // 3. Tạo entity từ DTO
            var wallet = _mapper.Map<Wallet>(dto);
            wallet.Id = Guid.NewGuid().ToString();
            wallet.UserId = userId;
            wallet.IsDefault = shouldBeDefault;
            wallet.CreatedAt = DateTime.UtcNow;

            await _context.Wallets.AddAsync(wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletReadDto>(wallet);
        }

        /// <summary>
        /// Cập nhật thông tin ví (tên, loại, icon, màu).
        /// Không cho phép sửa Balance trực tiếp — Balance chỉ thay đổi qua Transaction.
        /// </summary>
        public async Task<WalletReadDto?> UpdateAsync(string walletId, string userId, WalletUpdateDto dto)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

            if (wallet == null)
                throw new NotFoundException("Ví không tồn tại hoặc bạn không có quyền chỉnh sửa.");

            // Kiểm tra tên mới không trùng với ví khác của cùng user
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name != wallet.Name)
            {
                var isDuplicate = await _context.Wallets
                    .AnyAsync(w => w.UserId == userId && w.Name == dto.Name && w.Id != walletId);

                if (isDuplicate)
                    throw new BadRequestException("Tên ví đã tồn tại. Vui lòng chọn tên khác.");
            }

            _mapper.Map(dto, wallet);
            _context.Wallets.Update(wallet);
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletReadDto>(wallet);
        }

        /// <summary>
        /// Xóa ví. Không được xóa ví duy nhất của user.
        /// </summary>
        public async Task DeleteAsync(string walletId, string userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

            if (wallet == null)
                throw new NotFoundException("Ví không tồn tại hoặc bạn không có quyền xóa.");

            // Không cho xóa nếu là ví duy nhất
            var walletCount = await _context.Wallets.CountAsync(w => w.UserId == userId);
            if (walletCount <= 1)
                throw new BadRequestException("Không thể xóa ví duy nhất. Vui lòng tạo ví khác trước.");

            // Nếu xóa ví default → tự động gán ví cũ nhất còn lại làm default
            if (wallet.IsDefault)
            {
                var nextDefault = await _context.Wallets
                    .Where(w => w.UserId == userId && w.Id != walletId)
                    .OrderBy(w => w.CreatedAt)
                    .FirstOrDefaultAsync();

                if (nextDefault != null)
                    nextDefault.IsDefault = true;
            }

            _context.Wallets.Remove(wallet);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Đặt ví làm ví mặc định, đồng thời bỏ cờ IsDefault của các ví còn lại.
        /// </summary>
        public async Task<WalletReadDto?> SetDefaultAsync(string walletId, string userId)
        {
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

            if (wallet == null)
                throw new NotFoundException("Ví không tồn tại hoặc bạn không có quyền thực hiện.");

            if (wallet.IsDefault)
                return _mapper.Map<WalletReadDto>(wallet); // Đã là default rồi, không cần làm gì

            await ClearDefaultAsync(userId);
            wallet.IsDefault = true;
            await _context.SaveChangesAsync();

            return _mapper.Map<WalletReadDto>(wallet);
        }

        // Helper: Bỏ cờ IsDefault của tất cả ví thuộc user
        private async Task ClearDefaultAsync(string userId)
        {
            var defaultWallets = await _context.Wallets
                .Where(w => w.UserId == userId && w.IsDefault)
                .ToListAsync();

            foreach (var w in defaultWallets)
                w.IsDefault = false;
        }
    }
}
