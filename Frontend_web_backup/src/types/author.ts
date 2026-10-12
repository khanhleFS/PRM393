export type AuthorStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'BANNED'
export type TicketStatus = 'UNPAID' | 'PAID' | 'CANCELLED'

export interface CreateAuthorRequestDTO {
  username: string
  email: string
  password: string
  phone?: string
  address?: string
  penName: string
  bio?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
}

export interface AuthorProfileResponseDTO {
  id: string
  userId: string
  userEmail: string
  penName: string
  bio?: string
  authorCoinBalance: number
  totalNovels: number
  totalChapters: number
  totalViews: number
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  status: AuthorStatus
  createdAt: string
  updatedAt: string
}

export interface AuthorProfileRequestDTO {
  penName: string
  bio?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
}

export interface AuthorPaymentTicketDTO {
  id: string
  authorProfileId: string
  penName: string
  userEmail: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountHolder?: string
  monthYear: string
  totalCoins: number
  coinRate: number
  amountVnd: number
  status: TicketStatus
  paidAt?: string
  transactionRef?: string
  createdAt: string
}

export interface AuthorDashboardDTO {
  profile: AuthorProfileResponseDTO
  totalNovels: number
  totalChapters: number
  totalViews: number
  authorCoinBalance: number
  estimatedEarningsVnd: number
  recentTickets: AuthorPaymentTicketDTO[]
}
