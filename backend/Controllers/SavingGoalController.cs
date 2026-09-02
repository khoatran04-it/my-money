using System.Security.Claims;
using backend.Common;
using backend.DTOs.SavingGoal;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SavingGoalController : ControllerBase
    {
        private readonly ISavingGoalService _savingGoalService;

        public SavingGoalController(ISavingGoalService savingGoalService)
        {
            _savingGoalService = savingGoalService;
        }

        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy danh sách toàn bộ mục tiêu tích lũy và tóm tắt tiến độ chung của người dùng.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _savingGoalService.GetSummaryAsync(GetCurrentUserId());
            return Ok(ApiResponse<SavingGoalSummaryDto>.Ok(result, "Lấy thông tin mục tiêu tích lũy thành công."));
        }

        /// <summary>
        /// Lấy thông tin chi tiết một mục tiêu tích lũy theo Id.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetById(string id)
        {
            var result = await _savingGoalService.GetByIdAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<SavingGoalReadDto>.Ok(result!, "Lấy thông tin mục tiêu tích lũy thành công."));
        }

        /// <summary>
        /// Tạo mới một mục tiêu tích lũy (hỗ trợ nạp tiền ban đầu).
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] SavingGoalCreateDto dto)
        {
            var result = await _savingGoalService.CreateAsync(GetCurrentUserId(), dto);
            return Ok(ApiResponse<SavingGoalReadDto>.Ok(result, "Tạo mục tiêu tích lũy thành công."));
        }

        /// <summary>
        /// Cập nhật thông tin mục tiêu tích lũy.
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(string id, [FromBody] SavingGoalUpdateDto dto)
        {
            var result = await _savingGoalService.UpdateAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<SavingGoalReadDto>.Ok(result!, "Cập nhật mục tiêu tích lũy thành công."));
        }

        /// <summary>
        /// Xóa mục tiêu tích lũy (tiền trong quỹ tự động hoàn về số dư khả dụng của ví).
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete(string id)
        {
            await _savingGoalService.DeleteAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<bool>.Ok(true, "Xóa mục tiêu tích lũy thành công."));
        }

        /// <summary>
        /// Nạp thêm tiền từ số dư khả dụng của ví vào quỹ tiết kiệm.
        /// </summary>
        [HttpPost("{id}/deposit")]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Deposit(string id, [FromBody] SavingGoalDepositDto dto)
        {
            var result = await _savingGoalService.DepositAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<SavingGoalReadDto>.Ok(result!, "Nạp tiền vào quỹ tích lũy thành công."));
        }

        /// <summary>
        /// Rút tiền từ quỹ tiết kiệm hoàn trả về số dư khả dụng của ví.
        /// </summary>
        [HttpPost("{id}/withdraw")]
        [ProducesResponseType(typeof(ApiResponse<SavingGoalReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Withdraw(string id, [FromBody] SavingGoalWithdrawDto dto)
        {
            var result = await _savingGoalService.WithdrawAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<SavingGoalReadDto>.Ok(result!, "Rút tiền về ví thành công."));
        }
    }
}
