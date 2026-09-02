using FluentValidation;
using backend.DTOs.Wallet;

namespace backend.Validations
{
    /// <summary>
    /// Validator cho WalletCreateDto.
    /// </summary>
    public class WalletCreateDtoValidator : AbstractValidator<WalletCreateDto>
    {
        private static readonly string[] AllowedTypes =
            ["Cash", "BankAccount", "CreditCard", "EWallet", "Other"];

        public WalletCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên ví không được để trống.")
                .MaximumLength(100).WithMessage("Tên ví tối đa 100 ký tự.");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Loại ví không được để trống.")
                .Must(t => AllowedTypes.Contains(t))
                .WithMessage($"Loại ví phải là một trong: {string.Join(", ", AllowedTypes)}.");

            RuleFor(x => x.Balance)
                .GreaterThanOrEqualTo(0).WithMessage("Số dư ban đầu không được âm.");

            RuleFor(x => x.Color)
                .Matches(@"^#([0-9A-Fa-f]{6})$").WithMessage("Màu sắc phải là mã hex hợp lệ (vd: #3B82F6).")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }
    }

    /// <summary>
    /// Validator cho WalletUpdateDto.
    /// </summary>
    public class WalletUpdateDtoValidator : AbstractValidator<WalletUpdateDto>
    {
        private static readonly string[] AllowedTypes =
            ["Cash", "BankAccount", "CreditCard", "EWallet", "Other"];

        public WalletUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên ví không được để trống khi cập nhật.")
                .MaximumLength(100).WithMessage("Tên ví tối đa 100 ký tự.")
                .When(x => x.Name != null);

            RuleFor(x => x.Type)
                .Must(t => AllowedTypes.Contains(t!))
                .WithMessage($"Loại ví phải là một trong: {string.Join(", ", AllowedTypes)}.")
                .When(x => x.Type != null);

            RuleFor(x => x.Color)
                .Matches(@"^#([0-9A-Fa-f]{6})$").WithMessage("Màu sắc phải là mã hex hợp lệ (vd: #3B82F6).")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }
    }
}
