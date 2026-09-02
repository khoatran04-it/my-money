using System.Security.Claims;
using backend.Common;
using backend.DTOs.Dashboard;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy toàn bộ dữ liệu tổng quan, báo cáo phân tích tài chính và biểu đồ trực quan.
        /// </summary>
        [HttpGet("overview")]
        [ProducesResponseType(typeof(ApiResponse<DashboardOverviewDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOverview([FromQuery] DashboardFilterDto filter)
        {
            var result = await _dashboardService.GetOverviewAsync(GetCurrentUserId(), filter);
            return Ok(ApiResponse<DashboardOverviewDto>.Ok(result, "Lấy dữ liệu Dashboard thành công."));
        }
    }
}
