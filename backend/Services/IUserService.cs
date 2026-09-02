using backend.DTOs.User;

namespace backend.Services
{
    public interface IUserService
    {
        /// <summary>
        /// Task: Đăng ký người dùng mới (Trả về thông tin người dùng đã tạo)
        /// Nhận vào một đối tượng UserCreateDto chứa thông tin đăng ký của người dùng mới.
        /// Trả về một đối tượng UserReadDto chứa thông tin người dùng đã được tạo thành công.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        Task<UserReadDto> RegisterAsync(UserCreateDto dto);

        /// <summary>
        /// Task: Đăng nhập người dùng (Trả về thông tin người dùng và token)
        /// Nhận vào một đối tượng UserLoginDto chứa thông tin đăng nhập của người dùng.
        /// Trả về một đối tượng UserLoginResponseDto chứa thông tin người dùng và token nếu đăng nhập thành công, ngược lại trả về null.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        Task<UserLoginResponseDto?> LoginAsync(UserLoginDto dto);

        /// <summary>
        /// Task : Lấy thông tin cá nhân theo Id
        /// Nhận vào một chuỗi id đại diện cho người dùng.
        /// Trả về một đối tượng UserReadDto chứa thông tin cá nhân của người dùng nếu tìm thấy, ngược lại trả về null.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        Task<UserReadDto?> GetByIdAsync(string id);

        /// <summary>
        /// Task: Cập nhật thông tin cá nhân
        /// Nhận vào một chuỗi id đại diện cho người dùng và một đối tượng UserUpdateDto chứa thông tin cập nhật.
        /// Trả về một đối tượng UserReadDto chứa thông tin cá nhân đã được cập nhật nếu thành công, ngược lại trả về null.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        Task<UserReadDto?> UpdateProfileAsync(string id, UserUpdateDto dto);

        /// <summary>
        /// Task: Đổi mật khẩu
        /// Nhận vào một chuỗi id đại diện cho người dùng và một đối tượng UserChangePasswordDto chứa thông tin mật khẩu cũ và mật khẩu mới.
        /// Trả về true nếu đổi mật khẩu thành công, ngược lại trả về false.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        // 5. Task: Đổi mật khẩu
        Task<bool> ChangePasswordAsync(string id, UserChangePasswordDto dto);
    }
}