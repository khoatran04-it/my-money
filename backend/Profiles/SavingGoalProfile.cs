using AutoMapper;
using backend.DTOs.SavingGoal;
using backend.Models;

namespace backend.Profiles
{
    /// <summary>
    /// Cấu hình ánh xạ giữa thực thể SavingGoal và các DTO.
    /// </summary>
    public class SavingGoalProfile : Profile
    {
        public SavingGoalProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<SavingGoalCreateDto, SavingGoal>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentAmount, opt => opt.MapFrom(src => src.InitialDeposit))
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Wallet, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto
            CreateMap<SavingGoal, SavingGoalReadDto>()
                .ForMember(dest => dest.WalletName, opt => opt.MapFrom(src => src.Wallet != null ? src.Wallet.Name : null));

            // 3. Map UpdateDto -> Entity
            CreateMap<SavingGoalUpdateDto, SavingGoal>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.WalletId, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentAmount, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Wallet, opt => opt.Ignore());
        }
    }
}
