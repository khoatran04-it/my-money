using FluentValidation;
using backend.DTOs.Transaction;

namespace backend.Validations
{
    /// <summary>
    /// Validator cho TransactionCreateDto.
    /// </summary>
    public class TransactionCreateDtoValidator : AbstractValidator<TransactionCreateDto>
    {
        public TransactionCreateDtoValidator()
        {
            RuleFor(x => x.WalletId)
                .NotEmpty().WithMessage("Vui lòng chọn ví thực hiện giao dịch.");

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("Vui lòng chọn danh mục giao dịch.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Số tiền giao dịch phải lớn hơn 0.");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Loại giao dịch không hợp lệ (0: Income, 1: Expense).");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("Vui lòng chọn ngày giao dịch.");

            RuleFor(x => x.Note)
                .MaximumLength(500).WithMessage("Ghi chú không được vượt quá 500 ký tự.")
                .When(x => !string.IsNullOrEmpty(x.Note));
        }
    }

    /// <summary>
    /// Validator cho TransactionUpdateDto.
    /// </summary>
    public class TransactionUpdateDtoValidator : AbstractValidator<TransactionUpdateDto>
    {
        public TransactionUpdateDtoValidator()
        {
            RuleFor(x => x.WalletId)
                .NotEmpty().WithMessage("Vui lòng chọn ví thực hiện giao dịch.");

            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("Vui lòng chọn danh mục giao dịch.");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Số tiền giao dịch phải lớn hơn 0.");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Loại giao dịch không hợp lệ (0: Income, 1: Expense).");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("Vui lòng chọn ngày giao dịch.");

            RuleFor(x => x.Note)
                .MaximumLength(500).WithMessage("Ghi chú không được vượt quá 500 ký tự.")
                .When(x => !string.IsNullOrEmpty(x.Note));
        }
    }
}
