using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    Icon = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true),
                    Color = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Categories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Color", "CreatedAt", "Icon", "IsDefault", "Name", "Type", "UserId" },
                values: new object[,]
                {
                    { "cat-default-01", "#EF4444", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "utensils", true, "Ăn uống", "Expense", null },
                    { "cat-default-02", "#EC4899", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "shopping-bag", true, "Mua sắm", "Expense", null },
                    { "cat-default-03", "#F59E0B", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "car", true, "Di chuyển", "Expense", null },
                    { "cat-default-04", "#8B5CF6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "home", true, "Nhà cửa & Tiện ích", "Expense", null },
                    { "cat-default-05", "#3B82F6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "film", true, "Giải trí", "Expense", null },
                    { "cat-default-06", "#10B981", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "heart-pulse", true, "Sức khỏe", "Expense", null },
                    { "cat-default-07", "#06B6D4", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "graduation-cap", true, "Giáo dục", "Expense", null },
                    { "cat-default-08", "#10B981", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "briefcase", true, "Tiền lương", "Income", null },
                    { "cat-default-09", "#F59E0B", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "gift", true, "Tiền thưởng", "Income", null },
                    { "cat-default-10", "#3B82F6", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "trending-up", true, "Đầu tư", "Income", null },
                    { "cat-default-11", "#6366F1", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "dollar-sign", true, "Thu nhập phụ", "Income", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UserId",
                table: "Categories",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Categories");
        }
    }
}
