using backend.DTOs.User;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

namespace backend.Services
{
    public class JwtService : IJwtService
    {
        /// <summary>
        /// DI IConfiguration để truy cập các thiết lập cấu hình từ a
        /// ppsettings.json hoặc các nguồn khác.
        /// </summary>
        private readonly IConfiguration _config;
        public JwtService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(UserTokenDto dto)
        {
            // 1. Lấy các thiết lập từ IConfiguration
            var secretKey = _config["JwtSettings:SecretKey"];
            var issuer = _config["JwtSettings:Issuer"];
            var audience = _config["JwtSettings:Audience"];
            var expirationMinutes = int.Parse(_config["JwtSettings:ExpiryMinutes"] ?? "60");

            // 2. Chuyển SecretKey thành dạng mảng byte
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // 3. Tạo các claims cho token
            var claims = new[]
            {
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Sub, dto.Id),
                new System.Security.Claims.Claim(ClaimTypes.Email, dto.Email),
                new System.Security.Claims.Claim(ClaimTypes.Name, dto.UserName ?? string.Empty),
                new System.Security.Claims.Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // 4. Định nghĩa cấu trúc token trả về
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new System.Security.Claims.ClaimsIdentity(claims),
                Issuer = issuer,
                Audience = audience,
                Expires = DateTime.UtcNow.AddMinutes(expirationMinutes),
                SigningCredentials = credentials
            };

            // 5. Tạo token
            var handler = new JsonWebTokenHandler();
            string token = handler.CreateToken(tokenDescriptor);

            return token;
        }
    }
}
