using AutoMapper;
using backend.Data;
using backend.DTOs.SavingGoal;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class SavingGoalService : ISavingGoalService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;

        public SavingGoalService(MyMoneyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy danh sách toàn bộ mục tiêu tích lũy và tóm tắt tiến độ chung của người dùng.
        /// </summary>
        public async Task<SavingGoalSummaryDto> GetSummaryAsync(string userId)
        {
            var goals = await _context.SavingGoals
                .AsNoTracking()
                .Include(s => s.Wallet)
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var dtos = _mapper.Map<List<SavingGoalReadDto>>(goals);

            var totalTarget = dtos.Sum(g => g.TargetAmount);
            var totalSaved = dtos.Sum(g => g.CurrentAmount);
            var activeCount = dtos.Count(g => g.Status == "Active");
            var completedCount = dtos.Count(g => g.Status == "Completed");

            return new SavingGoalSummaryDto
            {
                TotalTarget = totalTarget,
                TotalSaved = totalSaved,
                ActiveGoalsCount = activeCount,
                CompletedGoalsCount = completedCount,
                Goals = dtos,
            };
        }

        /// <summary>
        /// Lấy chi tiết một mục tiêu tích lũy.
        /// </summary>
        public async Task<SavingGoalReadDto?> GetByIdAsync(string id, string userId)
        {
            var goal = await _context.SavingGoals
                .AsNoTracking()
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (goal == null)
            {
                throw new NotFoundException("Mục tiêu tích lũy không tồn tại hoặc bạn không có quyền truy cập.");
            }

            return _mapper.Map<SavingGoalReadDto>(goal);
        }

        /// <summary>
        /// Tạo mới một mục tiêu tích lũy và trích số tiền nạp ban đầu từ số dư khả dụng của ví.
        /// </summary>
        public async Task<SavingGoalReadDto> CreateAsync(string userId, SavingGoalCreateDto dto)
        {
            // 1. Kiểm tra ví hợp lệ
            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.Id == dto.WalletId && w.UserId == userId);

            if (wallet == null)
            {
                throw new BadRequestException("Ví được chọn không tồn tại hoặc không thuộc quyền sở hữu của bạn.");
            }

            // 2. Tính số dư khả dụng hiện tại của ví liên kết
            var currentReserved = await _context.SavingGoals
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.WalletId == dto.WalletId && s.Status == "Active")
                .SumAsync(s => s.CurrentAmount);

            var availableBalance = wallet.Balance - currentReserved;

            if (dto.InitialDeposit > 0 && dto.InitialDeposit > availableBalance)
            {
                throw new BadRequestException($"Số dư khả dụng của ví '{wallet.Name}' ({availableBalance:#,##0} VNĐ) không đủ để trích nạp ban đầu {dto.InitialDeposit:#,##0} VNĐ.");
            }

            // 3. Tạo mục tiêu
            var goal = _mapper.Map<SavingGoal>(dto);
            goal.Id = Guid.NewGuid().ToString();
            goal.UserId = userId;
            goal.CurrentAmount = dto.InitialDeposit;
            goal.Status = goal.CurrentAmount >= dto.TargetAmount ? "Completed" : "Active";
            goal.CreatedAt = DateTime.UtcNow;

            await _context.SavingGoals.AddAsync(goal);
            await _context.SaveChangesAsync();

            goal.Wallet = wallet;

            return _mapper.Map<SavingGoalReadDto>(goal);
        }

        /// <summary>
        /// Nạp thêm tiền từ số dư khả dụng của ví vào quỹ tiết kiệm.
        /// </summary>
        public async Task<SavingGoalReadDto?> DepositAsync(string id, string userId, SavingGoalDepositDto dto)
        {
            var goal = await _context.SavingGoals
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (goal == null)
            {
                throw new NotFoundException("Mục tiêu tích lũy không tồn tại hoặc bạn không có quyền truy cập.");
            }

            if (goal.Wallet == null)
            {
                throw new BadRequestException("Không tìm thấy thông tin ví liên kết với mục tiêu này.");
            }

            // Tính số dư khả dụng hiện tại của ví
            var currentReserved = await _context.SavingGoals
                .AsNoTracking()
                .Where(s => s.UserId == userId && s.WalletId == goal.WalletId && s.Status == "Active")
                .SumAsync(s => s.CurrentAmount);

            var availableBalance = goal.Wallet.Balance - currentReserved;

            if (dto.Amount > availableBalance)
            {
                throw new BadRequestException($"Số dư khả dụng của ví '{goal.Wallet.Name}' ({availableBalance:#,##0} VNĐ) không đủ để nạp thêm {dto.Amount:#,##0} VNĐ vào quỹ.");
            }

            goal.CurrentAmount += dto.Amount;
            if (goal.CurrentAmount >= goal.TargetAmount)
            {
                goal.Status = "Completed";
            }

            _context.SavingGoals.Update(goal);
            await _context.SaveChangesAsync();

            return _mapper.Map<SavingGoalReadDto>(goal);
        }

        /// <summary>
        /// Rút tiền từ quỹ tiết kiệm hoàn trả về số dư khả dụng của ví liên kết.
        /// </summary>
        public async Task<SavingGoalReadDto?> WithdrawAsync(string id, string userId, SavingGoalWithdrawDto dto)
        {
            var goal = await _context.SavingGoals
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (goal == null)
            {
                throw new NotFoundException("Mục tiêu tích lũy không tồn tại hoặc bạn không có quyền truy cập.");
            }

            if (dto.Amount > goal.CurrentAmount)
            {
                throw new BadRequestException($"Số tiền muốn rút ({dto.Amount:#,##0} VNĐ) vượt quá số tiền hiện có trong quỹ ({goal.CurrentAmount:#,##0} VNĐ).");
            }

            goal.CurrentAmount -= dto.Amount;
            if (goal.CurrentAmount < goal.TargetAmount && goal.Status == "Completed")
            {
                goal.Status = "Active";
            }

            _context.SavingGoals.Update(goal);
            await _context.SaveChangesAsync();

            return _mapper.Map<SavingGoalReadDto>(goal);
        }

        /// <summary>
        /// Cập nhật thông tin mục tiêu tích lũy.
        /// </summary>
        public async Task<SavingGoalReadDto?> UpdateAsync(string id, string userId, SavingGoalUpdateDto dto)
        {
            var goal = await _context.SavingGoals
                .Include(s => s.Wallet)
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (goal == null)
            {
                throw new NotFoundException("Mục tiêu tích lũy không tồn tại hoặc bạn không có quyền chỉnh sửa.");
            }

            goal.Name = dto.Name;
            goal.TargetAmount = dto.TargetAmount;
            goal.TargetDate = dto.TargetDate;
            if (dto.Color != null) goal.Color = dto.Color;
            if (dto.Icon != null) goal.Icon = dto.Icon;

            goal.Status = goal.CurrentAmount >= goal.TargetAmount ? "Completed" : "Active";

            _context.SavingGoals.Update(goal);
            await _context.SaveChangesAsync();

            return _mapper.Map<SavingGoalReadDto>(goal);
        }

        /// <summary>
        /// Xóa mục tiêu tích lũy. Số tiền trong quỹ tự động được giải phóng về số dư khả dụng của ví.
        /// </summary>
        public async Task DeleteAsync(string id, string userId)
        {
            var goal = await _context.SavingGoals
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

            if (goal == null)
            {
                throw new NotFoundException("Mục tiêu tích lũy không tồn tại hoặc bạn không có quyền xóa.");
            }

            _context.SavingGoals.Remove(goal);
            await _context.SaveChangesAsync();
        }
    }
}
