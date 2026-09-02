using FluentValidation;
using backend.DTOs.User;

namespace backend.Validations
{
    #region Validator Dto Cơ Bản
    /// <summary>
    /// Validator cho UserCreateDto, đảm bảo dữ liệu đầu vào hợp lệ khi tạo người dùng mới.
    /// </summary>
    public class UserCreateDtoValidator : AbstractValidator<UserCreateDto>
    {
        public UserCreateDtoValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
                .MinimumLength(3).WithMessage("Tên đăng nhập tối thiểu 3 ký tự.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email không được để trống.")
                .EmailAddress().WithMessage("Sai định dạng Email.");

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\d{10}$").WithMessage("Số điện thoại phải gồm 10 chữ số.")
                .When(x => !string.IsNullOrEmpty(x.PhoneNumber));
        }
    }

    /// <summary>
    /// Validator cho UserUpdateDto, đảm bảo dữ liệu đầu vào hợp lệ khi cập nhật thông tin người dùng.
    /// </summary>
    public class UserUpdateDtoValidator : AbstractValidator<UserUpdateDto>
    {
        public UserUpdateDtoValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống khi cập nhật.")
                .MinimumLength(3).WithMessage("Tên đăng nhập tối thiểu 3 ký tự.")
                .When(x => x.UserName != null);

            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Họ tên không được để chuỗi rỗng.")
                .When(x => x.FullName != null);

            RuleFor(x => x.PhoneNumber)
                .Matches(@"^\d{10}$").WithMessage("Số điện thoại phải gồm 10 chữ số.")
                .When(x => x.PhoneNumber != null);

            RuleFor(x => x.AvatarUrl)
                .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out _))
                .WithMessage("Đường dẫn Avatar không hợp lệ.")
                .When(x => !string.IsNullOrEmpty(x.AvatarUrl));
        }
    }
    #endregion

    /// <summary>
    /// Validator cho UserLoginDto, đảm bảo dữ liệu đầu vào hợp lệ khi người dùng đăng nhập.
    /// </summary>
    public class UserLoginDtoValidator : AbstractValidator<UserLoginDto>
    {
        public UserLoginDtoValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Tên đăng nhập không được để trống.")
                .MinimumLength(3).WithMessage("Tên đăng nhập tối thiểu 3 ký tự.");
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Mật khẩu không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu tối thiểu 6 ký tự.");
        }
    }

    /// <summary>
    /// Validator cho UserChangePasswordDto, đảm bảo dữ liệu đầu vào hợp lệ khi người dùng thay đổi mật khẩu.
    /// </summary>
    public class UserChangePasswordDtoValidator : AbstractValidator<UserChangePasswordDto>
    {
        public UserChangePasswordDtoValidator()
        {
            RuleFor(x => x.OldPassword)
                .NotEmpty().WithMessage("Mật khẩu cũ không được để trống.");
            RuleFor(x => x.NewPassword)
                .NotEmpty().WithMessage("Mật khẩu mới không được để trống.")
                .MinimumLength(6).WithMessage("Mật khẩu mới tối thiểu 6 ký tự.");
        }
    }
}