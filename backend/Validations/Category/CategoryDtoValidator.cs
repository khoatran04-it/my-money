using FluentValidation;
using backend.DTOs.Category;

namespace backend.Validations
{
    /// <summary>
    /// Validator cho CategoryCreateDto.
    /// </summary>
    public class CategoryCreateDtoValidator : AbstractValidator<CategoryCreateDto>
    {
        public CategoryCreateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên danh mục không được để trống.")
                .MaximumLength(100).WithMessage("Tên danh mục tối đa 100 ký tự.");

            RuleFor(x => x.Type)
                .IsInEnum().WithMessage("Loại danh mục không hợp lệ (0: Income, 1: Expense).");

            RuleFor(x => x.Color)
                .Matches(@"^#([0-9A-Fa-f]{6})$").WithMessage("Màu sắc phải là mã hex hợp lệ (vd: #EF4444).")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }
    }

    /// <summary>
    /// Validator cho CategoryUpdateDto.
    /// </summary>
    public class CategoryUpdateDtoValidator : AbstractValidator<CategoryUpdateDto>
    {
        public CategoryUpdateDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Tên danh mục không được để trống khi cập nhật.")
                .MaximumLength(100).WithMessage("Tên danh mục tối đa 100 ký tự.")
                .When(x => x.Name != null);

            RuleFor(x => x.Color)
                .Matches(@"^#([0-9A-Fa-f]{6})$").WithMessage("Màu sắc phải là mã hex hợp lệ (vd: #EF4444).")
                .When(x => !string.IsNullOrEmpty(x.Color));
        }
    }
}
