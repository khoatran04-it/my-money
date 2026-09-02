using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations
{
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.ToTable("Transactions");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.WalletId)
                .IsRequired();

            builder.Property(x => x.CategoryId)
                .IsRequired();

            builder.Property(x => x.Amount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.Type)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasColumnType("varchar(20)");

            builder.Property(x => x.Date)
                .IsRequired()
                .HasColumnType("datetime2");

            builder.Property(x => x.Note)
                .HasMaxLength(500)
                .HasColumnType("nvarchar(500)");

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Chỉ mục tăng tốc truy vấn lọc giao dịch theo User và Ngày
            builder.HasIndex(x => new { x.UserId, x.Date });

            // Quan hệ với User (dùng NoAction/Restrict để tránh chu kỳ cascade trong SQL Server)
            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với Wallet (Xóa Wallet sẽ xóa các giao dịch thuộc ví)
            builder.HasOne(x => x.Wallet)
                .WithMany()
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            // Quan hệ với Category (Không cho phép cascade delete để bảo vệ dữ liệu giao dịch)
            builder.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
