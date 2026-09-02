using System.Security.Claims;
using backend.Common;
using backend.DTOs.Wallet;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly IWalletService _walletService;

        public WalletController(IWalletService walletService)
        {
            _walletService = walletService;
        }

        // Hàm phụ trợ: Lấy Id của người dùng đang đăng nhập từ Token JWT
        private string GetCurrentUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
            ?? string.Empty;

        /// <summary>
        /// Lấy danh sách tất cả ví của người dùng đang đăng nhập.
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<List<WalletReadDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll()
        {
            var wallets = await _walletService.GetAllAsync(GetCurrentUserId());
            return Ok(ApiResponse<List<WalletReadDto>>.Ok(wallets, "Lấy danh sách ví thành công."));
        }

        /// <summary>
        /// Lấy chi tiết một ví theo Id.
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WalletReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetById(string id)
        {
            var wallet = await _walletService.GetByIdAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<WalletReadDto>.Ok(wallet!, "Lấy thông tin ví thành công."));
        }

        /// <summary>
        /// Tạo ví mới.
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<WalletReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Create([FromBody] WalletCreateDto dto)
        {
            var wallet = await _walletService.CreateAsync(GetCurrentUserId(), dto);
            return Ok(ApiResponse<WalletReadDto>.Ok(wallet, "Tạo ví thành công."));
        }

        /// <summary>
        /// Cập nhật thông tin ví (tên, loại, icon, màu).
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<WalletReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Update(string id, [FromBody] WalletUpdateDto dto)
        {
            var wallet = await _walletService.UpdateAsync(id, GetCurrentUserId(), dto);
            return Ok(ApiResponse<WalletReadDto>.Ok(wallet!, "Cập nhật ví thành công."));
        }

        /// <summary>
        /// Xóa ví theo Id.
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Delete(string id)
        {
            await _walletService.DeleteAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<bool>.Ok(true, "Xóa ví thành công."));
        }

        /// <summary>
        /// Đặt ví làm ví mặc định.
        /// </summary>
        [HttpPut("{id}/set-default")]
        [ProducesResponseType(typeof(ApiResponse<WalletReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> SetDefault(string id)
        {
            var wallet = await _walletService.SetDefaultAsync(id, GetCurrentUserId());
            return Ok(ApiResponse<WalletReadDto>.Ok(wallet!, "Đặt ví mặc định thành công."));
        }
    }
}
