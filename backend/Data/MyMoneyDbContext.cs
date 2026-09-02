using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data
{
    /// <summary>
    /// Lớp MyMoneyDbContext đại diện cho ngữ cảnh cơ sở dữ liệu của ứng dụng, 
    /// quản lý các thực thể và kết nối đến cơ sở dữ liệu.
    /// </summary>
    public class MyMoneyDbContext : DbContext
    {
        public MyMoneyDbContext(DbContextOptions<MyMoneyDbContext> options) : base(options)
        {
        }

        /// <summary>
        /// DbSet đại diện cho bảng Users trong cơ sở dữ liệu, chứa các thực thể User.
        /// </summary>
        public DbSet<User> Users { get; set; }

        /// <summary>
        /// DbSet đại diện cho bảng Wallets trong cơ sở dữ liệu, chứa các thực thể Wallet.
        /// </summary>
        public DbSet<Wallet> Wallets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Áp dụng các cấu hình từ assembly hiện tại, giúp tự động áp dụng
            // các cấu hình định nghĩa trong các lớp IEntityTypeConfiguration.
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(MyMoneyDbContext).Assembly);
            base.OnModelCreating(modelBuilder);
        }
    }

}
