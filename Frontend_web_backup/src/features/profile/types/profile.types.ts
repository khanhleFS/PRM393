import type React from 'react'

// ─── Profile View Types ───────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  displayName: string
  username: string
  email: string
  avatarUrl?: string
  memberSince: string
  isVerified: boolean
}

export interface WalletInfo {
  balance: number
  currency: string
}

export type TransactionType = 'topup' | 'spend'

export interface Transaction {
  id: string
  type: TransactionType
  title: string
  description: string
  amount: string
  status: string
  date: string
  method: string
  reference: string
}

export interface CollectionStory {
  id: string
  novelId: string
  title: string
  meta: string
  progress: number
  path: string
  coverUrl: string
  hideProgress?: boolean
}

export interface CollectionItem {
  key: string
  label: string
  stories: CollectionStory[]
}

export interface ProfileData {
  user: UserProfile
  wallet: WalletInfo
  transactions: Transaction[]
  collections: CollectionItem[]
}

// ─── Profile Request / Response DTOs ─────────────────────────────────────────

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

// ─── Profile Component Props & Helper Interfaces ─────────────────────────────

export interface InfoRow {
  label: string
  value: string
  icon: import('lucide-react').LucideIcon
}

export interface SectionTitleProps {
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}

export interface WalletCardProps {
  showActions?: boolean
}

export interface TransactionDetailModalProps {
  transaction: Transaction
  onClose: () => void
}

export interface DetailRowProps {
  label: string
  value: string
}

export interface CollectionStoryItemProps {
  story: CollectionStory
  onClick: () => void
}

// ─── Profile Context Interfaces ──────────────────────────────────────────────

export interface ProfileContextValue {
  data: ProfileData | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}
