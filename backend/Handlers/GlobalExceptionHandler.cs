using backend.Common;
using backend.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace backend.Handlers
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var statusCode = exception switch
            {
                BadRequestException or ValidationException => StatusCodes.Status400BadRequest,
                NotFoundException => StatusCodes.Status404NotFound,
                _ => StatusCodes.Status500InternalServerError
            };

            // Lấy danh sách lỗi nếu là lỗi từ FluentValidation
            List<string>? errorList = exception is ValidationException valEx ? valEx.Errors : null;

            var message = statusCode == 500 ? "Lỗi máy chủ nội bộ." : exception.Message;

            // Đóng gói vào ApiResponse
            var response = ApiResponse<object>.Fail(message, errorList);

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);

            return true;
        }
    }
}