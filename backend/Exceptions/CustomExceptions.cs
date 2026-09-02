namespace backend.Exceptions
{
    // 1. Lỗi dữ liệu đầu vào hoặc vi phạm logic (Trả về 400)
    public class BadRequestException : Exception
    {
        public BadRequestException(string message) : base(message) { }
    }

    // 2. Lỗi không tìm thấy dữ liệu (Trả về 404)
    public class NotFoundException : Exception
    {
        public NotFoundException(string message) : base(message) { }
    }

    // 3. Lỗi do FluentValidation bắt được (Trả về 400 + Danh sách lỗi)
    public class ValidationException : Exception
    {
        public List<string> Errors { get; }
        public ValidationException(List<string> errors) : base("Dữ liệu đầu vào không hợp lệ.")
        {
            Errors = errors;
        }
    }
}