using FluentValidation;
using backend.DTOs.Budget;

namespace backend.Validations
{
    /// <summary>
    /// Validator cho BudgetCreateDto.
    /// </summary>
    public class BudgetCreateDtoValidator : AbstractValidator<BudgetCreateDto>
    {
        public BudgetCreateDtoValidator()
        {
            RuleFor(x => x.CategoryId)
                .NotEmpty().WithMessage("Vui lòng chọn danh mục cho ngân sách.");

            RuleFor(x => x.LimitAmount)
                .GreaterThan(0).WithMessage("Hạn mức ngân sách phải lớn hơn 0.");

            RuleFor(x => x.Month)
                .InclusiveBetween(1, 12).WithMessage("Tháng áp dụng phải từ 1 đến 12.");

            RuleFor(x => x.Year)
                .GreaterThanOrEqualTo(2000).WithMessage("Năm không hợp lệ.");
        }
    }

    /// <summary>
    /// Validator cho BudgetUpdateDto.
    /// </summary>
    public class BudgetUpdateDtoValidator : AbstractValidator<BudgetUpdateDto>
    {
        public BudgetUpdateDtoValidator()
        {
            RuleFor(x => x.LimitAmount)
                .GreaterThan(0).WithMessage("Hạn mức ngân sách phải lớn hơn 0.");
        }
    }
}
