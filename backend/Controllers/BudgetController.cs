using System.Security.Claims;
using backend.Common;
using backend.DTOs.Budget;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetService _budgetService;

        public BudgetController(IBudgetService budgetService)
        {
            _budgetService = budgetService;
        }

        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy tổng quan ngân sách và tiến độ chi tiêu theo tháng và năm.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<BudgetSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetSummary([FromQuery] int? month, [FromQuery] int? year)
        {
            var now = DateTime.UtcNow;
            var targetMonth = month ?? now.Month;
            var targetYear = year ?? now.Year;

            var result = await _budgetService.GetSummaryAsync(GetCurrentUserId(), targetMonth, targetYear);
            return Ok(ApiResponse<BudgetSummaryDto>.Ok(result, "Lấy thông tin ngân sách thành công."));
        }

        /// <summary>
        /// Lấy chi tiết một ngân sách theo Id.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<BudgetReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _budgetService.GetByIdAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<BudgetReadDto>.Ok(result!, "Lấy thông tin ngân sách thành công."));
        }

        /// <summary>
        /// Tạo mới hạn mức ngân sách cho danh mục.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<BudgetReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] BudgetCreateDto dto)
        {
            var result = await _budgetService.CreateAsync(GetCurrentUserId(), dto);
            return Ok(ApiResponse<BudgetReadDto>.Ok(result, "Tạo hạn mức ngân sách thành công."));
        }

        /// <summary>
        /// Cập nhật hạn mức ngân sách.
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<BudgetReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(string id, [FromBody] BudgetUpdateDto dto)
        {
            var result = await _budgetService.UpdateAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<BudgetReadDto>.Ok(result!, "Cập nhật ngân sách thành công."));
        }

        /// <summary>
        /// Xóa ngân sách.
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete(string id)
        {
            await _budgetService.DeleteAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<bool>.Ok(true, "Xóa ngân sách thành công."));
        }
    }
}
