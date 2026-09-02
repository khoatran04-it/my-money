export interface UserReadDto {
  id: string;
  userName: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface UserCreateDto {
  userName: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UserUpdateDto {
  userName?: string;
  fullName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export interface UserLoginDto {
  userName: string;
  password: string;
}

export interface UserLoginResponseDto {
  token: string;
  user: UserReadDto;
}

export interface UserChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}