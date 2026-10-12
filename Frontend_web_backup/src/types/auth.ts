export interface User {
  id: string | number
  username: string
  email: string
  role: string
  isAuthor?: boolean
  avatarUrl?: string
  fullName?: string
  coinBalance?: number
}

// ─── Auth Request / Response DTOs ───────────────────────────────────────────

export interface LoginRequestDTO {
  email: string
  password: string
}

export interface LoginResponseDTO {
  accessToken: string
  refreshToken: string  // Dùng cho luồng non-cookie (mobile / cross-domain)
  userId: string
  username: string
  email: string
  role: string
  isAuthor?: boolean
}

export interface RegisterRequestDTO {
  fullName: string
  phone: string
  email: string
  password: string
  confirmPassword: string
  isActive: boolean
}

export interface VerifyOtpRequestDTO {
  email: string
  otpCode: string
}

export interface ForgotPasswordRequestDTO {
  email: string
}

export interface ForgotPasswordResponseDTO {
  email: string
  message: string
  success: boolean
}

export interface ResetPasswordResponseDTO {
  email: string
  message: string
  userId: string | number
}

export interface TokenRefreshRequestDTO {
  refreshToken: string
}


