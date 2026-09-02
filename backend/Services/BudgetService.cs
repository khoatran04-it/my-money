using AutoMapper;
using backend.Data;
using backend.DTOs.Budget;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;

        public BudgetService(MyMoneyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy tổng quan ngân sách và tiến độ chi tiêu theo từng danh mục trong tháng/năm.
        /// </summary>
        public async Task<BudgetSummaryDto> GetSummaryAsync(string userId, int month, int year)
        {
            // 1. Lấy danh sách ngân sách của user trong kỳ
            var budgets = await _context.Budgets
                .AsNoTracking()
                .Include(b => b.Category)
                .Where(b => b.UserId == userId && b.Month == month && b.Year == year)
                .ToListAsync();

            // 2. Tính tổng tiền chi tiêu thực tế theo từng danh mục trong kỳ từ bảng Transactions
            var expenseMap = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId
                            && t.Type == TransactionType.Expense
                            && t.Date.Month == month
                            && t.Date.Year == year)
                .GroupBy(t => t.CategoryId)
                .Select(g => new { CategoryId = g.Key, TotalSpent = g.Sum(t => t.Amount) })
                .ToDictionaryAsync(x => x.CategoryId, x => x.TotalSpent);

            // 3. Ánh xạ và tính toán các chỉ số tiến độ chi tiêu
            var budgetDtos = new List<BudgetReadDto>();
            foreach (var budget in budgets)
            {
                var dto = _mapper.Map<BudgetReadDto>(budget);
                var spent = expenseMap.GetValueOrDefault(budget.CategoryId, 0m);

                dto.SpentAmount = spent;
                dto.RemainingAmount = budget.LimitAmount - spent;
                dto.Percentage = budget.LimitAmount > 0
                    ? Math.Round((double)(spent / budget.LimitAmount) * 100, 1)
                    : 0;
                dto.IsOverBudget = spent > budget.LimitAmount;

                budgetDtos.Add(dto);
            }

            // Sắp xếp: Ngân sách vượt hạn mức lên đầu, sau đó theo % chi tiêu giảm dần
            budgetDtos = budgetDtos
                .OrderByDescending(b => b.IsOverBudget)
                .ThenByDescending(b => b.Percentage)
                .ToList();

            var totalLimit = budgets.Sum(b => b.LimitAmount);
            var totalSpent = budgetDtos.Sum(b => b.SpentAmount);

            return new BudgetSummaryDto
            {
                TotalLimit = totalLimit,
                TotalSpent = totalSpent,
                TotalRemaining = totalLimit - totalSpent,
                OverallPercentage = totalLimit > 0
                    ? Math.Round((double)(totalSpent / totalLimit) * 100, 1)
                    : 0,
                Month = month,
                Year = year,
                Budgets = budgetDtos,
            };
        }

        /// <summary>
        /// Lấy chi tiết một ngân sách.
        /// </summary>
        public async Task<BudgetReadDto?> GetByIdAsync(string budgetId, string userId)
        {
            var budget = await _context.Budgets
                .AsNoTracking()
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

            if (budget == null)
            {
                throw new NotFoundException("Ngân sách không tồn tại hoặc bạn không có quyền truy cập.");
            }

            // Tính số tiền đã chi
            var spent = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId
                            && t.CategoryId == budget.CategoryId
                            && t.Type == TransactionType.Expense
                            && t.Date.Month == budget.Month
                            && t.Date.Year == budget.Year)
                .SumAsync(t => t.Amount);

            var dto = _mapper.Map<BudgetReadDto>(budget);
            dto.SpentAmount = spent;
            dto.RemainingAmount = budget.LimitAmount - spent;
            dto.Percentage = budget.LimitAmount > 0
                ? Math.Round((double)(spent / budget.LimitAmount) * 100, 1)
                : 0;
            dto.IsOverBudget = spent > budget.LimitAmount;

            return dto;
        }

        /// <summary>
        /// Tạo mới một hạn mức ngân sách.
        /// </summary>
        public async Task<BudgetReadDto> CreateAsync(string userId, BudgetCreateDto dto)
        {
            // 1. Kiểm tra danh mục hợp lệ và phải là loại Chi tiêu
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId && (c.UserId == null || c.UserId == userId));

            if (category == null)
            {
                throw new BadRequestException("Danh mục được chọn không tồn tại.");
            }

            if (category.Type != TransactionType.Expense)
            {
                throw new BadRequestException("Ngân sách chỉ được thiết lập cho các danh mục Chi tiêu.");
            }

            // 2. Kiểm tra trùng lặp
            var isDuplicate = await _context.Budgets
                .AnyAsync(b => b.UserId == userId
                            && b.CategoryId == dto.CategoryId
                            && b.Month == dto.Month
                            && b.Year == dto.Year);

            if (isDuplicate)
            {
                throw new BadRequestException($"Đã tồn tại hạn mức cho danh mục '{category.Name}' trong tháng {dto.Month}/{dto.Year}.");
            }

            // 3. Tạo entity
            var budget = _mapper.Map<Budget>(dto);
            budget.Id = Guid.NewGuid().ToString();
            budget.UserId = userId;
            budget.CreatedAt = DateTime.UtcNow;

            await _context.Budgets.AddAsync(budget);
            await _context.SaveChangesAsync();

            budget.Category = category;

            // 4. Tính toán số tiền đã chi
            var spent = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId
                            && t.CategoryId == budget.CategoryId
                            && t.Type == TransactionType.Expense
                            && t.Date.Month == budget.Month
                            && t.Date.Year == budget.Year)
                .SumAsync(t => t.Amount);

            var result = _mapper.Map<BudgetReadDto>(budget);
            result.SpentAmount = spent;
            result.RemainingAmount = budget.LimitAmount - spent;
            result.Percentage = budget.LimitAmount > 0
                ? Math.Round((double)(spent / budget.LimitAmount) * 100, 1)
                : 0;
            result.IsOverBudget = spent > budget.LimitAmount;

            return result;
        }

        /// <summary>
        /// Cập nhật hạn mức ngân sách.
        /// </summary>
        public async Task<BudgetReadDto?> UpdateAsync(string budgetId, string userId, BudgetUpdateDto dto)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

            if (budget == null)
            {
                throw new NotFoundException("Ngân sách không tồn tại hoặc bạn không có quyền chỉnh sửa.");
            }

            budget.LimitAmount = dto.LimitAmount;

            _context.Budgets.Update(budget);
            await _context.SaveChangesAsync();

            var spent = await _context.Transactions
                .AsNoTracking()
                .Where(t => t.UserId == userId
                            && t.CategoryId == budget.CategoryId
                            && t.Type == TransactionType.Expense
                            && t.Date.Month == budget.Month
                            && t.Date.Year == budget.Year)
                .SumAsync(t => t.Amount);

            var result = _mapper.Map<BudgetReadDto>(budget);
            result.SpentAmount = spent;
            result.RemainingAmount = budget.LimitAmount - spent;
            result.Percentage = budget.LimitAmount > 0
                ? Math.Round((double)(spent / budget.LimitAmount) * 100, 1)
                : 0;
            result.IsOverBudget = spent > budget.LimitAmount;

            return result;
        }

        /// <summary>
        /// Xóa ngân sách.
        /// </summary>
        public async Task DeleteAsync(string budgetId, string userId)
        {
            var budget = await _context.Budgets
                .FirstOrDefaultAsync(b => b.Id == budgetId && b.UserId == userId);

            if (budget == null)
            {
                throw new NotFoundException("Ngân sách không tồn tại hoặc bạn không có quyền xóa.");
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
        }
    }
}
