using System.Security.Claims;
using backend.Common;
using backend.DTOs.Transaction;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy danh sách giao dịch với các tùy chọn lọc và phân trang.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<PagedResult<TransactionReadDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetPaged([FromQuery] TransactionFilterDto filter)
        {
            var result = await _transactionService.GetPagedAsync(GetCurrentUserId(), filter);
            return Ok(ApiResponse<PagedResult<TransactionReadDto>>.Ok(result, "Lấy danh sách giao dịch thành công."));
        }

        /// <summary>
        /// Lấy chi tiết một giao dịch theo Id.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<TransactionReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetById(string id)
        {
            var transaction = await _transactionService.GetByIdAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<TransactionReadDto>.Ok(transaction!, "Lấy thông tin giao dịch thành công."));
        }

        /// <summary>
        /// Tạo giao dịch mới (tự động cập nhật số dư ví).
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<TransactionReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] TransactionCreateDto dto)
        {
            var transaction = await _transactionService.CreateAsync(GetCurrentUserId(), dto);
            return Ok(ApiResponse<TransactionReadDto>.Ok(transaction, "Tạo giao dịch thành công."));
        }

        /// <summary>
        /// Cập nhật thông tin giao dịch (tự động điều chỉnh số dư ví).
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<TransactionReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(string id, [FromBody] TransactionUpdateDto dto)
        {
            var transaction = await _transactionService.UpdateAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<TransactionReadDto>.Ok(transaction!, "Cập nhật giao dịch thành công."));
        }

        /// <summary>
        /// Xóa giao dịch và hoàn lại số dư cho ví.
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete(string id)
        {
            await _transactionService.DeleteAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<bool>.Ok(true, "Xóa giao dịch thành công."));
        }
    }
}
