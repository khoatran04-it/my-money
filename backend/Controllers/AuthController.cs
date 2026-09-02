using backend.Common;
using backend.DTOs.User;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        /// <summary>
        /// Task: Đăng ký người dùng mới
        /// </summary>
        /// <param name="dto">Thông tin đăng ký</param>
        /// <returns>Dữ liệu người dùng vừa tạo</returns>
        [HttpPost("register")]
        [ProducesResponseType(typeof(ApiResponse<UserReadDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] UserCreateDto dto)
        {
            var user = await _userService.RegisterAsync(dto);
            return Ok(ApiResponse<UserReadDto>.Ok(user, "Đăng ký tài khoản thành công."));
        }

        /// <summary>
        /// Task: Đăng nhập người dùng
        /// </summary>
        /// <param name="dto">Thông tin đăng nhập</param>
        /// <returns>Token JWT và thông tin người dùng</returns>
        [HttpPost("login")]
        [ProducesResponseType(typeof(ApiResponse<UserLoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            var result = await _userService.LoginAsync(dto);
            return Ok(ApiResponse<UserLoginResponseDto>.Ok(result!, "Đăng nhập thành công."));
        }
    }
}