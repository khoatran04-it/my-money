using AutoMapper;
using backend.Data;
using backend.DTOs.Category;
using backend.Enums;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;

        public CategoryService(MyMoneyDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        /// <summary>
        /// Lấy tất cả danh mục của hệ thống (UserId == null) và của người dùng (UserId == userId).
        /// </summary>
        public async Task<List<CategoryReadDto>> GetAllAsync(string userId, TransactionType? type = null)
        {
            var query = _context.Categories
                .AsNoTracking()
                .Where(c => c.UserId == null || c.UserId == userId);

            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            var categories = await query
                .OrderByDescending(c => c.IsDefault)
                .ThenBy(c => c.Name)
                .ToListAsync();

            return _mapper.Map<List<CategoryReadDto>>(categories);
        }

        /// <summary>
        /// Lấy chi tiết một danh mục.
        /// </summary>
        public async Task<CategoryReadDto?> GetByIdAsync(string categoryId, string userId)
        {
            var category = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == categoryId && (c.UserId == null || c.UserId == userId));

            if (category == null)
            {
                throw new NotFoundException("Danh mục không tồn tại hoặc bạn không có quyền truy cập.");
            }

            return _mapper.Map<CategoryReadDto>(category);
        }

        /// <summary>
        /// Tạo danh mục mới cho người dùng.
        /// </summary>
        public async Task<CategoryReadDto> CreateAsync(string userId, CategoryCreateDto dto)
        {
            // Kiểm tra trùng tên danh mục với cùng loại trong hệ thống hoặc của user
            var isDuplicate = await _context.Categories
                .AnyAsync(c => (c.UserId == null || c.UserId == userId)
                            && c.Type == dto.Type
                            && c.Name.ToLower() == dto.Name.Trim().ToLower());

            if (isDuplicate)
            {
                throw new BadRequestException($"Danh mục '{dto.Name}' cho loại {(dto.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu")} đã tồn tại.");
            }

            var category = _mapper.Map<Category>(dto);
            category.Id = Guid.NewGuid().ToString();
            category.UserId = userId;
            category.Name = dto.Name.Trim();
            category.IsDefault = false;
            category.CreatedAt = DateTime.UtcNow;

            await _context.Categories.AddAsync(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryReadDto>(category);
        }

        /// <summary>
        /// Cập nhật thông tin danh mục.
        /// </summary>
        public async Task<CategoryReadDto?> UpdateAsync(string categoryId, string userId, CategoryUpdateDto dto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                throw new NotFoundException("Danh mục không tồn tại.");
            }

            if (category.IsDefault || category.UserId == null)
            {
                throw new BadRequestException("Không thể chỉnh sửa danh mục mặc định của hệ thống.");
            }

            if (category.UserId != userId)
            {
                throw new NotFoundException("Bạn không có quyền chỉnh sửa danh mục này.");
            }

            // Kiểm tra trùng tên nếu có cập nhật tên
            if (!string.IsNullOrWhiteSpace(dto.Name) && !dto.Name.Trim().Equals(category.Name, StringComparison.OrdinalIgnoreCase))
            {
                var isDuplicate = await _context.Categories
                    .AnyAsync(c => (c.UserId == null || c.UserId == userId)
                                && c.Type == category.Type
                                && c.Name.ToLower() == dto.Name.Trim().ToLower()
                                && c.Id != categoryId);

                if (isDuplicate)
                {
                    throw new BadRequestException($"Danh mục '{dto.Name}' cho loại {(category.Type == TransactionType.Income ? "Thu nhập" : "Chi tiêu")} đã tồn tại.");
                }

                category.Name = dto.Name.Trim();
            }

            if (dto.Icon != null) category.Icon = dto.Icon;
            if (dto.Color != null) category.Color = dto.Color;

            _context.Categories.Update(category);
            await _context.SaveChangesAsync();

            return _mapper.Map<CategoryReadDto>(category);
        }

        /// <summary>
        /// Xóa danh mục.
        /// </summary>
        public async Task DeleteAsync(string categoryId, string userId)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == categoryId);

            if (category == null)
            {
                throw new NotFoundException("Danh mục không tồn tại.");
            }

            if (category.IsDefault || category.UserId == null)
            {
                throw new BadRequestException("Không thể xóa danh mục mặc định của hệ thống.");
            }

            if (category.UserId != userId)
            {
                throw new NotFoundException("Bạn không có quyền xóa danh mục này.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}
