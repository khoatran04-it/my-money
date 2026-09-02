namespace backend.DTOs.User
{
    #region DTOs Cơ Bản 
    /// <summary>
    /// DTO tạo người dùng mới.
    /// </summary>
    public class UserCreateDto
    {
        public required string UserName { get; set; }
        public required string Password { get; set; } // Mật khẩu gốc chưa hash
        public required string Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
    }

    /// <summary>
    /// DTO đọc thông tin người dùng.
    /// </summary>
    public class UserReadDto
    {
        public required string Id { get; set; }
        public required string UserName { get; set; }
        public required string Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// DTO cập nhật thông tin người dùng.
    /// </summary>
    public class UserUpdateDto
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
    }
    #endregion

    /// <summary>
    /// DTO chứa thông tin token của người dùng.
    /// </summary>
    public class UserTokenDto
    {
        public required string Id { get; set; }
        public required string Email { get; set; }
        public required string UserName { get; set; }
    }

    /// <summary>
    /// DTO đăng nhập người dùng.
    /// </summary>
    public class UserLoginDto
    {
        public required string UserName { get; set; }
        public required string Password { get; set; }
    }

    /// <summary>
    /// DTO phản hồi sau khi đăng nhập thành công, bao gồm token và thông tin người dùng.
    /// </summary>
    public class UserLoginResponseDto
    {
        public required string Token { get; set; }
        public required UserReadDto User { get; set; }
    }

    /// <summary>
    /// DTO thay đổi mật khẩu người dùng.
    /// </summary>
    public class UserChangePasswordDto
    {
        public required string OldPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}