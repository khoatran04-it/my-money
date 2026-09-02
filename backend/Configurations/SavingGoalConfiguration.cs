using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations
{
    public class SavingGoalConfiguration : IEntityTypeConfiguration<SavingGoal>
    {
        public void Configure(EntityTypeBuilder<SavingGoal> builder)
        {
            builder.ToTable("SavingGoals");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.WalletId)
                .IsRequired();

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnType("nvarchar(150)");

            builder.Property(x => x.TargetAmount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(x => x.CurrentAmount)
                .IsRequired()
                .HasColumnType("decimal(18,2)")
                .HasDefaultValue(0);

            builder.Property(x => x.Color)
                .HasMaxLength(20)
                .HasColumnType("varchar(20)");

            builder.Property(x => x.Icon)
                .HasMaxLength(50)
                .HasColumnType("varchar(50)");

            builder.Property(x => x.Status)
                .IsRequired()
                .HasMaxLength(30)
                .HasColumnType("varchar(30)")
                .HasDefaultValue("Active");

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Chỉ mục lọc theo người dùng và trạng thái mục tiêu
            builder.HasIndex(x => new { x.UserId, x.Status });

            // Quan hệ với User
            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Quan hệ với Wallet (Restrict để đảm bảo không xóa nhầm ví đang giữ quỹ tiết kiệm)
            builder.HasOne(x => x.Wallet)
                .WithMany()
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
