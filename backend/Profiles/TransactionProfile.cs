using AutoMapper;
using backend.DTOs.Transaction;
using backend.Models;

namespace backend.Profiles
{
    /// <summary>
    /// Cấu hình ánh xạ giữa thực thể Transaction và các DTO.
    /// </summary>
    public class TransactionProfile : Profile
    {
        public TransactionProfile()
        {
            // 1. Map CreateDto -> Entity
            CreateMap<TransactionCreateDto, Transaction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Wallet, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore());

            // 2. Map Entity -> ReadDto (ánh xạ kèm thông tin ví và danh mục)
            CreateMap<Transaction, TransactionReadDto>()
                .ForMember(dest => dest.WalletName, opt => opt.MapFrom(src => src.Wallet != null ? src.Wallet.Name : null))
                .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.CategoryIcon, opt => opt.MapFrom(src => src.Category != null ? src.Category.Icon : null))
                .ForMember(dest => dest.CategoryColor, opt => opt.MapFrom(src => src.Category != null ? src.Category.Color : null));

            // 3. Map UpdateDto -> Entity
            CreateMap<TransactionUpdateDto, Transaction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.User, opt => opt.Ignore())
                .ForMember(dest => dest.Wallet, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.Ignore());
        }
    }
}
