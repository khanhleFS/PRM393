import type { LucideIcon } from 'lucide-react'

// ─── Finance Models ──────────────────────────────────────────────────────────

export interface CashFlowItem {
  label: string
  value: number
}

export interface DepositItem {
  user: string
  method: string
  amount: number
  status: 'success' | 'pending'
  time: string
}

export interface KpiData {
  id: number
  title: string
  subtitle: string
  amount: string
  growth: string
  actionText: string
  isPrimary: boolean
  icon: LucideIcon | any
}

export interface TransactionItem {
  id: string
  user: string
  fullName: string
  method: string
  amount: number
  coins: number
  status: 'success' | 'pending' | 'failed'
  time: string
}

export interface FinanceData {
  kpiData: KpiData[]
  cashFlow: CashFlowItem[]
  cashFlowMonth: CashFlowItem[]
  recentDeposits: DepositItem[]
  transactions: TransactionItem[]
}

// ─── Context Type ────────────────────────────────────────────────────────────

export interface FinanceContextValue {
  data: FinanceData | null
  isLoading: boolean
  error: string | null
  refresh: () => void
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface KpiCardProps {
  data: KpiData
}

export interface CashFlowChartProps {
  cashFlow: CashFlowItem[]
  cashFlowMonth: CashFlowItem[]
}

export interface FinanceTransactionTableProps {
  transactions?: TransactionItem[]
}

export interface FinanceKpiSectionProps {
  kpiData: KpiData[]
}

export interface FinanceChartsAndDepositsSectionProps {
  cashFlow: CashFlowItem[]
  cashFlowMonth: CashFlowItem[]
  recentDeposits: DepositItem[]
}
