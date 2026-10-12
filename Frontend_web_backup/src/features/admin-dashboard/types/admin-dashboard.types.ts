import type React from 'react'

// ─── Dashboard Data Models ───────────────────────────────────────────────────

export interface DashboardRecentOrder {
  orderId: string
  userEmail: string
  username: string
  amountVnd: number
  status: string
  createdAt: string
}

export interface AdminDashboardData {
  totalUsers: number
  totalAuthors: number
  totalNovels: number
  totalRevenueVnd: number
  platformRevenueVnd: number
  monthlyRevenueVnd: number[]
  recentOrders: DashboardRecentOrder[]
}

export type DashboardData = AdminDashboardData

// ─── Dashboard Context Type ──────────────────────────────────────────────────

export interface DashboardContextValue {
  data: AdminDashboardData | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

// ─── Package Tier Model ──────────────────────────────────────────────────────

export interface PackageTier {
  id: string
  name: string
  price: number
  coin: number
  bonus: number
  isPopular?: boolean
}

// ─── Component Props Interfaces ──────────────────────────────────────────────

export interface DashboardChartSectionProps {
  chartData: number[]
  platformNet: number
}

export interface DashboardUserPulseSectionProps {
  totalUsers: number
  totalAuthors: number
  totalNovels: number
}

export interface DashboardTransactionsSectionProps {
  recentOrders: DashboardRecentOrder[]
}

export interface DashboardPackagesSectionProps {
  packageTiers: PackageTier[]
}

export interface PulseCardProps {
  label: string
  value: number
  icon: React.ReactNode
  iconBg: string
}

export interface PackageCardProps {
  data: PackageTier
}
