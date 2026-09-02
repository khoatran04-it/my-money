export type WalletType = 'Cash' | 'BankAccount' | 'CreditCard' | 'EWallet' | 'Other';

export interface WalletReadDto {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  balance: number;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
}

export interface WalletCreateDto {
  name: string;
  type: WalletType;
  balance?: number;
  icon?: string;
  color?: string;
  isDefault?: boolean;
}

export interface WalletUpdateDto {
  name?: string;
  type?: WalletType;
  icon?: string;
  color?: string;
}

// Label hiển thị cho từng loại ví
export const WALLET_TYPE_LABELS: Record<WalletType, string> = {
  Cash: 'Tiền mặt',
  BankAccount: 'Tài khoản ngân hàng',
  CreditCard: 'Thẻ tín dụng',
  EWallet: 'Ví điện tử',
  Other: 'Khác',
};
