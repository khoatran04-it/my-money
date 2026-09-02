using AutoMapper;
using backend.DTOs.Budget;
using backend.Models;

namespace backend.Profiles
{
    /// <summary>
    /// Cấu hình ánh xạ giữa thực thể Budget và các DTO.
    /// </summary>
    public class BudgetProfile : Profile
    {
        public BudgetProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<BudgetCreateDto, Budget>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto
            CreateMap<Budget, BudgetReadDto>()
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.CategoryIcon, opt => opt.MapFrom(src => src.Category != null ? src.Category.Icon : null))
                .ForMember(dest => dest.CategoryColor, opt => opt.MapFrom(src => src.Category != null ? src.Category.Color : null))
                .ForMember(dest => dest.SpentAmount, opt => opt.Ignore())
                .ForMember(dest => dest.RemainingAmount, opt => opt.Ignore())
                .ForMember(dest => dest.Percentage, opt => opt.Ignore())
                .ForMember(dest => dest.IsOverBudget, opt => opt.Ignore());
        }
    }
}
