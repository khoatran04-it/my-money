using AutoMapper;
using backend.Data;
using backend.DTOs.User;
using backend.Exceptions;
using backend.Models;
using Microsoft.EntityFrameworkCore;
namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly MyMoneyDbContext _context;
        private readonly IMapper _mapper;
        private readonly IJwtService _jwtService;

        public UserService(MyMoneyDbContext context, IMapper mapper, IJwtService jwtService)
        {
            _context = context;
            _mapper = mapper;
            _jwtService = jwtService;
        }

        /// <summary>
        /// Đăng ký người dùng mới
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        /// <exception cref="BadRequestException"></exception>
        public async Task<UserReadDto> RegisterAsync(UserCreateDto dto)
        {
            //1. Kiểm tra xem tên đăng nhập, email hoặc số điện thoại đã tồn tại trong cơ sở dữ liệu hay chưa
            var isDuplicate = await _context.Users
                .AnyAsync(u => u.UserName == dto.UserName
                            || u.Email == dto.Email
                            || u.PhoneNumber == dto.PhoneNumber);

            if (isDuplicate)
            {
                throw new BadRequestException("Tên đăng nhập, Email hoặc Số điện thoại đã được sử dụng.");
            }

            //2. Tạo một đối tượng User từ dto
            var user = _mapper.Map<User>(dto);

            // 3. Gán thủ công các trường nghiệp vụ hệ thống
            user.Id = Guid.NewGuid().ToString();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.IsActive = true;

            // 4. Lưu dữ liệu
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            // 5. Chuyển đổi Entity sang ReadDto để trả về
            return _mapper.Map<UserReadDto>(user);
        }

        /// <summary>
        /// Đăng nhập người dùng
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        /// <exception cref="BadRequestException"></exception>
        public async Task<UserLoginResponseDto?> LoginAsync(UserLoginDto dto)
        {
            // 1. Tìm người dùng theo tên đăng nhập
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserName == dto.UserName);

            // 2. Kiểm tra xem người dùng có tồn tại và mật khẩu có khớp không
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                throw new BadRequestException("Tên đăng nhập hoặc mật khẩu không đúng.");
            }

            // 3. Kiểm tra trạng thái tài khoản
            if (!user.IsActive)
            {
                throw new BadRequestException("Tài khoản của bạn đã bị vô hiệu hóa.");
            }

            // 4. Khởi tạo thông tin Token và gọi JwtService sinh Token
            var tokenDto = new UserTokenDto
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
            };

            var token = _jwtService.GenerateToken(tokenDto);

            //5. Đóng gói kế quả phản hồi
            return new UserLoginResponseDto
            {
                Token = token,
                User = _mapper.Map<UserReadDto>(user)
            };
        }

        /// <summary>
        /// Lấy thông tin người dùng theo Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        /// <exception cref="NotFoundException"></exception>
        public async Task<UserReadDto?> GetByIdAsync(string id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
            {
                throw new NotFoundException("Người dùng không tồn tại.");
            }
            return _mapper.Map<UserReadDto>(user);
        }

        /// <summary>
        /// Cập nhật thông tin người dùng
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        /// <exception cref="NotFoundException"></exception>
        public async Task<UserReadDto?> UpdateProfileAsync(string id, UserUpdateDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new NotFoundException("Người dùng không tồn tại.");
            }

            // 1. Kiểm tra trùng lặp UserName nếu người dùng có yêu cầu đổi UserName
            //Người dùng nhập mới và khác với hiện tại
            if (!string.IsNullOrEmpty(dto.UserName) && dto.UserName != user.UserName)
            {
                var isUserNameTaken = await _context.Users
                    .AnyAsync(u => u.UserName == dto.UserName && u.Id != id);

                if (isUserNameTaken)
                {
                    throw new BadRequestException("Tên đăng nhập này đã được sử dụng bởi tài khoản khác.");
                }
            }

            // 2. Kiểm tra trùng lặp PhoneNumber nếu có yêu cầu đổi Số điện thoại
            //Người dùng nhập mới và khác với hiện tại
            if (!string.IsNullOrEmpty(dto.PhoneNumber) && dto.PhoneNumber != user.PhoneNumber)
            {
                var isPhoneTaken = await _context.Users
                    .AnyAsync(u => u.PhoneNumber == dto.PhoneNumber && u.Id != id);

                if (isPhoneTaken)
                {
                    throw new BadRequestException("Số điện thoại này đã được sử dụng bởi tài khoản khác.");
                }
            }

            // 3. Ánh xạ các giá trị không null từ DTO sang Entity hiện tại
            _mapper.Map(dto, user);

            // 4. Lưu thay đổi
            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserReadDto>(user);
        }

        /// <summary>
        /// Đổi mật khẩu người dùng
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        /// <exception cref="NotFoundException"></exception>
        /// <exception cref="BadRequestException"></exception>
        public async Task<bool> ChangePasswordAsync(string id, UserChangePasswordDto dto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                throw new NotFoundException($"Không tìm thấy người dùng với Id: {id}");
            }

            // 1. Kiểm tra mật khẩu cũ có chính xác không
            var isOldPasswordValid = BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash);
            if (!isOldPasswordValid)
            {
                throw new BadRequestException("Mật khẩu cũ không chính xác.");
            }

            // 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ
            if (dto.OldPassword == dto.NewPassword)
            {
                throw new BadRequestException("Mật khẩu mới không được trùng với mật khẩu cũ.");
            }

            // 3. Băm mật khẩu mới và cập nhật
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return true;
        }

    }
}
