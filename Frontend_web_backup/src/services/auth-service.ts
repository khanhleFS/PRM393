import { api } from '@/lib/api'
import type { 
  LoginRequestDTO, 
  LoginResponseDTO, 
  RegisterRequestDTO, 
  VerifyOtpRequestDTO, 
  EnumResponseDTO,
  ForgotPasswordRequestDTO,
  ForgotPasswordResponseDTO,
  ResetPasswordRequestDTO,
  ResetPasswordResponseDTO,
  ProfileDTO,
  TokenRefreshRequestDTO
} from '@/types'

/**
 * Authenticates a user with email and password.
 * @returns LoginResponseDTO containing the accessToken and user info.
 * @throws Error with backend message on failure.
 */
export async function loginUser(request: LoginRequestDTO): Promise<LoginResponseDTO> {
  const response = await api.post('/auth/login', request)
  if (response.data && response.data.code === 200) {
    return response.data.result as LoginResponseDTO
  }
  throw new Error(response.data?.message || 'Đăng nhập thất bại')
}

/**
 * Logs out the user on the backend.
 */
export async function logoutUser(): Promise<void> {
  const response = await api.post('/auth/logout')
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Đăng xuất thất bại')
}

/**
 * Retrieves the current authenticated user's profile.
 * Returns any because the backend ProfileDTO only contains (fullName, email, phone, address).
 * Missing fields (id, role) are preserved from existing Zustand state.
 */
export async function getUserProfile(): Promise<any> {
  const response = await api.get('/profile')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải thông tin cá nhân')
}

/**
 * Updates the current authenticated user's profile.
 */
export async function updateUserProfile(request: ProfileDTO): Promise<void> {
  const response = await api.put('/profile', request)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Cập nhật thông tin thất bại')
}

/**
 * Requests a password reset link/new password to be sent to user's email.
 */
export async function forgotPassword(request: ForgotPasswordRequestDTO): Promise<ForgotPasswordResponseDTO> {
  const response = await api.post('/auth/forgot-password', request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Yêu cầu quên mật khẩu thất bại')
}

/**
 * Resets the password using old password.
 */
export async function resetPassword(request: ResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO> {
  const response = await api.post('/auth/reset-password', request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Đặt lại mật khẩu thất bại')
}

/**
 * Refreshes the session using the Refresh Token.
 */
export async function refreshToken(request: TokenRefreshRequestDTO): Promise<LoginResponseDTO> {
  const response = await api.post('/auth/refresh', request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Làm mới token thất bại')
}



/**
 * Registers a new user account.
 * On success, the user should be directed to OTP verification.
 * @throws Error with backend message on failure.
 */
export async function registerUser(request: RegisterRequestDTO): Promise<void> {
  const response = await api.post('/auth/register', request)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Đăng ký thất bại')
}

/**
 * Verifies the OTP code sent to the user's email after registration.
 * @throws Error with backend message on failure.
 */
export async function verifyRegisterOtp(request: VerifyOtpRequestDTO): Promise<void> {
  const response = await api.post('/auth/verify-register-otp', request)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Xác thực OTP thất bại')
}

/**
 * Resends a new OTP code to the given email address.
 * @throws Error with backend message on failure.
 */
export async function resendOtp(email: string): Promise<void> {
  const response = await api.post('/auth/forgot-password', { email })
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Gửi lại OTP thất bại')
}

/**
 * Lấy danh sách enum của Auth (UserRole) từ backend.
 */
export async function getAuthEnums(): Promise<EnumResponseDTO[]> {
  const response = await api.get('/auth/enums')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải enums của tài khoản')
}

