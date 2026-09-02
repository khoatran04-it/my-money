using System.Security.Claims;
using backend.Common;
using backend.DTOs.User;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        // Hàm phụ trợ: Lấy Id của người dùng đang đăng nhập từ Token JWT
        private string GetCurrentUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
                ?? string.Empty;
        }

        /// <summary>
        /// Lấy thông tin hồ sơ của người dùng đang đăng nhập.
        /// </summary>
        /// <returns>Thông tin chi tiết của người dùng</returns>
        [HttpGet("profile")]
        [ProducesResponseType(typeof(ApiResponse<UserReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProfile()
        {
            var userId = GetCurrentUserId();
            var user = await _userService.GetByIdAsync(userId);

            return Ok(ApiResponse<UserReadDto>.Ok(user!, "Lấy thông tin thành công."));
        }

        /// <summary>
        /// Cập nhật thông tin hồ sơ cá nhân.
        /// </summary>
        /// <param name="dto">Các thông tin cần cập nhật (Tên, Số điện thoại...)</param>
        /// <returns>Thông tin người dùng sau khi cập nhật</returns>
        [HttpPut("profile")]
        [ProducesResponseType(typeof(ApiResponse<UserReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto dto)
        {
            var userId = GetCurrentUserId();
            var user = await _userService.UpdateProfileAsync(userId, dto);

            return Ok(ApiResponse<UserReadDto>.Ok(user!, "Cập nhật hồ sơ thành công."));
        }

        /// <summary>
        /// Đổi mật khẩu tài khoản.
        /// </summary>
        /// <param name="dto">Mật khẩu cũ và mật khẩu mới</param>
        /// <returns>Trạng thái đổi mật khẩu</returns>
        [HttpPut("change-password")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] UserChangePasswordDto dto)
        {
            var userId = GetCurrentUserId();
            await _userService.ChangePasswordAsync(userId, dto);

            return Ok(ApiResponse<bool>.Ok(true, "Đổi mật khẩu thành công."));
        }
    }
}