namespace backend.Enums
{
    /// <summary>
    /// Loại giao dịch: Thu nhập hoặc Chi tiêu.
    /// Dùng chung cho Category và Transaction.
    /// </summary>
    public enum TransactionType
    {
        Income,  // Thu nhập
        Expense  // Chi tiêu
    }

    /// <summary>
    /// Loại ví / tài khoản tiền.
    /// </summary>
    public enum WalletType
    {
        Cash,        // Tiền mặt
        BankAccount, // Tài khoản ngân hàng
        CreditCard,  // Thẻ tín dụng
        EWallet,     // Ví điện tử
        Other        // Khác
    }
}
