export interface ProfileDTO {
  fullName: string
  email: string
  phone: string
  address: string
  coinBalance?: number
}

export interface CoinTransactionResponseDTO {
  transactionId: string
  userName: string
  packageName: string
  amount: number
  transactionType: string
  paymentMethod: string
  status: string
  createdAt: string
}

export interface ResetPasswordRequestDTO {
  email: string
  oldPassword: string
  newPassword: string
  confirmPassword: string
}
