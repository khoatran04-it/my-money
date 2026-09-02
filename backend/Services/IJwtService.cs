using backend.DTOs.User;

namespace backend.Services
{
    public interface IJwtService
    {
        /// <summary>
        /// Task: Tạo một JWT token dựa trên thông tin của người dùng.
        /// Nhận vào một đối tượng UserTokenDto và trả về một chuỗi token.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        string GenerateToken(UserTokenDto dto);
    }
}