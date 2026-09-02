using AutoMapper;
using backend.DTOs.Category;
using backend.Models;

namespace backend.Profiles
{
    /// <summary>
    /// Cấu hình ánh xạ giữa các DTO và thực thể Category.
    /// </summary>
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<CategoryCreateDto, Category>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.IsDefault, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto
            CreateMap<Category, CategoryReadDto>();

            // 3. Map UpdateDto -> Entity (chỉ map các field không null)
            CreateMap<CategoryUpdateDto, Category>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
