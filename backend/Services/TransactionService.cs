using AutoMapper;
using backend.Common;
using backend.Data;
using backend.DTOs.Transaction;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;

        public TransactionService(MyMoneyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách giao dịch có lọc và phân trang.
        /// </summary>
        public async Task<PagedResult<TransactionReadDto>> GetPagedAsync(string userId, TransactionFilterDto filter)
        {
            var query = _context.Transactions
                .AsNoTracking()
                .Include(t => t.Wallet)
                .Include(t => t.Category)
                .Where(t => t.UserId == userId);

            // 1. Áp dụng các bộ lọc
            if (!string.IsNullOrEmpty(filter.WalletId))
            {
                query = query.Where(t => t.WalletId == filter.WalletId);
            }

            if (!string.IsNullOrEmpty(filter.CategoryId))
            {
                query = query.Where(t => t.CategoryId == filter.CategoryId);
            }

            if (filter.Type.HasValue)
            {
                query = query.Where(t => t.Type == filter.Type.Value);
            }

            if (filter.StartDate.HasValue)
            {
                var start = filter.StartDate.Value.Date;
                query = query.Where(t => t.Date >= start);
            }

            if (filter.EndDate.HasValue)
            {
                var end = filter.EndDate.Value.Date.AddDays(1).AddTicks(-1);
                query = query.Where(t => t.Date <= end);
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.Trim().ToLower();
                query = query.Where(t => t.Note != null && t.Note.ToLower().Contains(search));
            }

            // 2. Đếm tổng số bản ghi trước khi phân trang
            var totalCount = await query.CountAsync();

            // 3. Sắp xếp theo ngày giao dịch giảm dần, sau đó theo ngày tạo
            var items = await query
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var dtos = _mapper.Map<List<TransactionReadDto>>(items);

            return new PagedResult<TransactionReadDto>(dtos, totalCount, filter.PageNumber, filter.PageSize);
        }

        /// <summary>
        /// Lấy chi tiết một giao dịch.
        /// </summary>
        public async Task<TransactionReadDto?> GetByIdAsync(string transactionId, string userId)
        {
            var transaction = await _context.Transactions
                .AsNoTracking()
                .Include(t => t.Wallet)
                .Include(t => t.Category)
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
            {
                throw new NotFoundException("Giao dịch không tồn tại hoặc bạn không có quyền truy cập.");
            }

            return _mapper.Map<TransactionReadDto>(transaction);
        }

        /// <summary>
        /// Tạo giao dịch mới và tự động cập nhật số dư của ví.
        /// </summary>
        public async Task<TransactionReadDto> CreateAsync(string userId, TransactionCreateDto dto)
        {
            // 1. Kiểm tra ví hợp lệ
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == dto.WalletId && w.UserId == userId);

            if (wallet == null)
            {
                throw new BadRequestException("Ví được chọn không tồn tại hoặc không thuộc quyền sở hữu của bạn.");
            }

            // 2. Kiểm tra danh mục hợp lệ
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && (c.UserId == null || c.UserId == userId));

            if (category == null)
            {
                throw new BadRequestException("Danh mục được chọn không tồn tại.");
            }

            if (category.Type != dto.Type)
            {
                var catTypeName = category.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu";
                var transTypeName = dto.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu";
                throw new BadRequestException($"Danh mục '{category.Name}' là {catTypeName}, không thể dùng cho giao dịch {transTypeName}.");
            }

            // 3. Tạo entity giao dịch
            var transaction = _mapper.Map<Transaction>(dto);
            transaction.Id = Guid.NewGuid().ToString();
            transaction.UserId = userId;
            transaction.CreatedAt = DateTime.UtcNow;

            // 4. Cập nhật số dư ví
            if (dto.Type == TransactionType.Expense)
            {
                // Kiểm tra số dư khả dụng thực tế của ví (trừ các khoản đã giữ cho mục tiêu tích lũy)
                var currentReserved = await _context.SavingGoals
                    .AsNoTracking()
                    .Where(s => s.UserId == userId && s.WalletId == wallet.Id && s.Status == "Active")
                    .SumAsync(s => s.CurrentAmount);

                var availableBalance = wallet.Balance - currentReserved;

                if (dto.Amount > availableBalance)
                {
                    throw new BadRequestException(
                        $"Số dư khả dụng của ví '{wallet.Name}' ({availableBalance:#,##0.##} VNĐ) không đủ để thực hiện khoản chi {dto.Amount:#,##0.##} VNĐ."
                    );
                }

                wallet.Balance -= dto.Amount;
            }
            else
            {
                wallet.Balance += dto.Amount;
            }

            _context.Wallets.Update(wallet);
            await _context.Transactions.AddAsync(transaction);
            await _context.SaveChangesAsync();

            // Gán để AutoMapper ánh xạ đầy đủ thông tin tên ví & danh mục
            transaction.Wallet = wallet;
            transaction.Category = category;

            return _mapper.Map<TransactionReadDto>(transaction);
        }

        /// <summary>
        /// Cập nhật giao dịch và hoàn chuyển số dư ví chính xác.
        /// </summary>
        public async Task<TransactionReadDto?> UpdateAsync(string transactionId, string userId, TransactionUpdateDto dto)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
            {
                throw new NotFoundException("Giao dịch không tồn tại hoặc bạn không có quyền cập nhật.");
            }

            // 1. Lấy ví cũ và hoàn tác số dư cũ
            var oldWallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == transaction.WalletId && w.UserId == userId);

            if (oldWallet != null)
            {
                if (transaction.Type == TransactionType.Expense)
                {
                    oldWallet.Balance += transaction.Amount; // Hoàn lại tiền chi
                }
                else
                {
                    oldWallet.Balance -= transaction.Amount; // Trừ lại tiền thu
                }
            }

            // 2. Lấy ví mới
            Wallet? targetWallet;
            if (dto.WalletId == transaction.WalletId && oldWallet != null)
            {
                targetWallet = oldWallet;
            }
            else
            {
                targetWallet = await _context.Wallets
                    .FirstOrDefaultAsync(w => w.Id == dto.WalletId && w.UserId == userId);

                if (targetWallet == null)
                {
                    throw new BadRequestException("Ví mới được chọn không tồn tại.");
                }
            }

            // 3. Kiểm tra danh mục mới
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && (c.UserId == null || c.UserId == userId));

            if (category == null)
            {
                throw new BadRequestException("Danh mục được chọn không tồn tại.");
            }

            if (category.Type != dto.Type)
            {
                var catTypeName = category.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu";
                var transTypeName = dto.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu";
                throw new BadRequestException($"Danh mục '{category.Name}' là {catTypeName}, không thể dùng cho giao dịch {transTypeName}.");
            }

            // 4. Áp dụng số dư mới cho ví mới
            if (dto.Type == TransactionType.Expense)
            {
                // Kiểm tra số dư khả dụng thực tế của ví mới
                var currentReserved = await _context.SavingGoals
                    .AsNoTracking()
                    .Where(s => s.UserId == userId && s.WalletId == targetWallet.Id && s.Status == "Active")
                    .SumAsync(s => s.CurrentAmount);

                var availableBalance = targetWallet.Balance - currentReserved;

                if (dto.Amount > availableBalance)
                {
                    throw new BadRequestException(
                        $"Số dư khả dụng của ví '{targetWallet.Name}' ({availableBalance:#,##0.##} VNĐ) không đủ để thực hiện khoản chi {dto.Amount:#,##0.##} VNĐ."
                    );
                }

                targetWallet.Balance -= dto.Amount;
            }
            else
            {
                targetWallet.Balance += dto.Amount;
            }

            // 5. Cập nhật thông tin giao dịch
            _mapper.Map(dto, transaction);

            if (oldWallet != null && oldWallet.Id != targetWallet.Id)
            {
                _context.Wallets.Update(oldWallet);
            }
            _context.Wallets.Update(targetWallet);
            _context.Transactions.Update(transaction);

            await _context.SaveChangesAsync();

            transaction.Wallet = targetWallet;
            transaction.Category = category;

            return _mapper.Map<TransactionReadDto>(transaction);
        }

        /// <summary>
        /// Xóa giao dịch và hoàn lại số dư cho ví.
        /// </summary>
        public async Task DeleteAsync(string transactionId, string userId)
        {
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == transactionId && t.UserId == userId);

            if (transaction == null)
            {
                throw new NotFoundException("Giao dịch không tồn tại hoặc bạn không có quyền xóa.");
            }

            // Hoàn lại số dư ví
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == transaction.WalletId && w.UserId == userId);

            if (wallet != null)
            {
                if (transaction.Type == TransactionType.Expense)
                {
                    wallet.Balance += transaction.Amount; // Chi tiêu bị xóa -> cộng lại tiền vào ví
                }
                else
                {
                    wallet.Balance -= transaction.Amount; // Thu nhập bị xóa -> trừ lại tiền khỏi ví
                }
                _context.Wallets.Update(wallet);
            }

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
        }
    }
}
