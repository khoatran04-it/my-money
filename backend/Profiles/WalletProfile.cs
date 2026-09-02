using AutoMapper;
using backend.Models;
using backend.DTOs.Wallet;

namespace backend.Profiles
{
    /// <summary>
    /// Cấu hình ánh xạ giữa các DTO và thực thể Wallet.
    /// </summary>
    public class WalletProfile : Profile
    {
        public WalletProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<WalletCreateDto, Wallet>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto
            CreateMap<Wallet, WalletReadDto>();

            // 3. Map UpdateDto -> Entity (chỉ map các field không null)
            CreateMap<WalletUpdateDto, Wallet>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
