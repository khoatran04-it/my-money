using backend.DTOs.Dashboard;

namespace backend.Services
{
    public interface IDashboardService
    {
        /// <summary>
        /// Lấy toàn bộ dữ liệu phân tích tài chính, báo cáo thu chi, biểu đồ xu hướng và cảnh báo cho Dashboard.
        /// </summary>
        Task<DashboardOverviewDto> GetOverviewAsync(string userId, DashboardFilterDto filter);
    }
}
