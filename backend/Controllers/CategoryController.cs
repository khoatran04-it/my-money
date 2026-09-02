using System.Security.Claims;
using backend.Common;
using backend.DTOs.Category;
using backend.Enums;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy danh sách danh mục (hệ thống + người dùng). Có thể lọc theo loại (Income / Expense).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<List<CategoryReadDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll([FromQuery] TransactionType? type)
        {
            var categories = await _categoryService.GetAllAsync(GetCurrentUserId(), type);
            return Ok(ApiResponse<List<CategoryReadDto>>.Ok(categories, "Lấy danh sách danh mục thành công."));
        }

        /// <summary>
        /// Lấy chi tiết một danh mục theo Id.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CategoryReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetById(string id)
        {
            var category = await _categoryService.GetByIdAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<CategoryReadDto>.Ok(category!, "Lấy thông tin danh mục thành công."));
        }

        /// <summary>
        /// Tạo danh mục mới cho người dùng.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<CategoryReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
        {
            var category = await _categoryService.CreateAsync(GetCurrentUserId(), dto);
            return Ok(ApiResponse<CategoryReadDto>.Ok(category, "Tạo danh mục thành công."));
        }

        /// <summary>
        /// Cập nhật danh mục riêng của người dùng.
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<CategoryReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(string id, [FromBody] CategoryUpdateDto dto)
        {
            var category = await _categoryService.UpdateAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<CategoryReadDto>.Ok(category!, "Cập nhật danh mục thành công."));
        }

        /// <summary>
        /// Xóa danh mục riêng của người dùng.
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete(string id)
        {
            await _categoryService.DeleteAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<bool>.Ok(true, "Xóa danh mục thành công."));
        }
    }
}
