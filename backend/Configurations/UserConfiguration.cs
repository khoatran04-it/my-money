using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration <User>
    {
        /// <summary>
        /// Cấu hình các thuộc tính của thực thể User trong cơ sở dữ liệu.
        /// </summary>
        /// <param name="builder"></param> 
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.UserName)
                .IsRequired()
                .HasMaxLength(50)
                .HasColumnType("varchar(50)");
            builder.HasIndex(x => x.UserName)
                .IsUnique();
            builder.Property(x => x.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);
            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(150)
                .HasColumnType("varchar(150)");
            builder.HasIndex(x => x.Email)
                .IsUnique();
            builder.Property(x => x.FullName)
                .HasMaxLength(150)
                .HasColumnType("nvarchar(150)");
            builder.Property(x => x.PhoneNumber)
                .HasMaxLength(20)
                .HasColumnType("varchar(20)");
            builder.HasIndex(x => x.PhoneNumber)
                .IsUnique()
                .HasFilter("[PhoneNumber] IS NOT NULL");
            builder.Property(x => x.AvatarUrl)
                .HasMaxLength(500);
            builder.Property(x => x.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETUTCDATE()");
            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);
        }
    }
}
