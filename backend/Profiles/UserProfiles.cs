using AutoMapper;
using backend.Models;
using backend.DTOs.User;

namespace backend.Profiles
{
    /// <summary>
    /// Lớp UserProfile định nghĩa các cấu hình ánh xạ giữa các DTO và thực thể User.
    /// </summary>
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<UserCreateDto, User>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto
            CreateMap<User, UserReadDto>();

            // 3. Map UpdateDto -> Entity
            CreateMap<UserUpdateDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        }
    }
}