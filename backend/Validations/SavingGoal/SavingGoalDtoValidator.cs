using FluentValidation;
using backend.DTOs.SavingGoal;

namespace backend.Validations
{
    /// <summary>
    /// Validator cho SavingGoalCreateDto.
    /// </summary>
    public class SavingGoalCreateDtoValidator : AbstractValidator<SavingGoalCreateDto>
    {
        public SavingGoalCreateDtoValidator()
        {
            RuleFor(x => x.WalletId)
                .NotEmpty().WithMessage("Vui lòng chọn ví liên kết với mục tiêu tiết kiệm.");

            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên mục tiêu không được để trống.")
                .MaximumLength(150).WithMessage("Tên mục tiêu tối đa 150 ký tự.");

            RuleFor(x => x.TargetAmount)
                .GreaterThan(0).WithMessage("Số tiền mục tiêu phải lớn hơn 0.");

            RuleFor(x => x.InitialDeposit)
                .GreaterThanOrEqualTo(0).WithMessage("Số tiền gửi ban đầu không được âm.");
        }
    }

    /// <summary>
    /// Validator cho SavingGoalUpdateDto.
    /// </summary>
    public class SavingGoalUpdateDtoValidator : AbstractValidator<SavingGoalUpdateDto>
    {
        public SavingGoalUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên mục tiêu không được để trống.")
                .MaximumLength(150).WithMessage("Tên mục tiêu tối đa 150 ký tự.");

            RuleFor(x => x.TargetAmount)
                .GreaterThan(0).WithMessage("Số tiền mục tiêu phải lớn hơn 0.");
        }
    }

    /// <summary>
    /// Validator cho SavingGoalDepositDto.
    /// </summary>
    public class SavingGoalDepositDtoValidator : AbstractValidator<SavingGoalDepositDto>
    {
        public SavingGoalDepositDtoValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Số tiền nạp vào quỹ phải lớn hơn 0.");
        }
    }

    /// <summary>
    /// Validator cho SavingGoalWithdrawDto.
    /// </summary>
    public class SavingGoalWithdrawDtoValidator : AbstractValidator<SavingGoalWithdrawDto>
    {
        public SavingGoalWithdrawDtoValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Số tiền rút khỏi quỹ phải lớn hơn 0.");
        }
    }
}
