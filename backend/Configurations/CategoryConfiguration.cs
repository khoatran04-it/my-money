using backend.Enums;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        /// <summary>
        /// Cấu hình các thuộc tính của thực thể Category trong cơ sở dữ liệu.
        /// </summary>
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.ToTable("Categories");

            builder.HasKey(x => x.Id);

            // UserId nullable — null = danh mục hệ thống
            builder.Property(x => x.UserId)
                .IsRequired(false);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(100)
                .HasColumnType("nvarchar(100)");

            // Lưu enum TransactionType dưới dạng string ("Income" / "Expense")
            builder.Property(x => x.Type)
                .IsRequired()
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasColumnType("varchar(20)");

            builder.Property(x => x.Icon)
                .HasMaxLength(50)
                .HasColumnType("varchar(50)");

            builder.Property(x => x.Color)
                .HasMaxLength(20)
                .HasColumnType("varchar(20)");

            builder.Property(x => x.IsDefault)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");

            // Quan hệ: Category thuộc về 1 User (nullable — danh mục hệ thống không có User)
            builder.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);

            // Dữ liệu danh mục mặc định của hệ thống (Seed Data)
            builder.HasData(
                // Chi tiêu (Expense)
                new Category { Id = "cat-default-01", Name = "Ăn uống", Type = TransactionType.Expense, Icon = "utensils", Color = "#EF4444", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-02", Name = "Mua sắm", Type = TransactionType.Expense, Icon = "shopping-bag", Color = "#EC4899", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-03", Name = "Di chuyển", Type = TransactionType.Expense, Icon = "car", Color = "#F59E0B", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-04", Name = "Nhà cửa & Tiện ích", Type = TransactionType.Expense, Icon = "home", Color = "#8B5CF6", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-05", Name = "Giải trí", Type = TransactionType.Expense, Icon = "film", Color = "#3B82F6", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-06", Name = "Sức khỏe", Type = TransactionType.Expense, Icon = "heart-pulse", Color = "#10B981", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-07", Name = "Giáo dục", Type = TransactionType.Expense, Icon = "graduation-cap", Color = "#06B6D4", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },

                // Thu nhập (Income)
                new Category { Id = "cat-default-08", Name = "Tiền lương", Type = TransactionType.Income, Icon = "briefcase", Color = "#10B981", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-09", Name = "Tiền thưởng", Type = TransactionType.Income, Icon = "gift", Color = "#F59E0B", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-10", Name = "Đầu tư", Type = TransactionType.Income, Icon = "trending-up", Color = "#3B82F6", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new Category { Id = "cat-default-11", Name = "Thu nhập phụ", Type = TransactionType.Income, Icon = "dollar-sign", Color = "#6366F1", IsDefault = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        }
    }
}
