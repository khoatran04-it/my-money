namespace backend.Models
{
    /// <summary>
    /// Lớp User đại diện cho một người dùng trong hệ thống.
    /// </summary>
    public class User
    {
        public required string Id { get; set; }
        public required string UserName { get; set; }
        public required string PasswordHash { get; set; }
        public required string Email { get; set; }
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
