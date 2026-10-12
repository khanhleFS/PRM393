import { useFinance } from './context/finance.context'
import { FinanceSkeleton } from './components/finance-skeleton'
import {
  FinanceChartsAndDepositsSection,
  FinanceKpiSection,
  FinanceTransactionTable,
} from './components/finance-sections'

function FinanceContent() {
  const { data, isLoading } = useFinance()

  if (isLoading || !data) {
    return <FinanceSkeleton />
  }

  const { kpiData, cashFlow, cashFlowMonth, recentDeposits, transactions } = data

  return (
    <div className="space-y-6">
      <FinanceKpiSection kpiData={kpiData} />
      <FinanceChartsAndDepositsSection
        cashFlow={cashFlow}
        cashFlowMonth={cashFlowMonth}
        recentDeposits={recentDeposits}
      />
      <FinanceTransactionTable transactions={transactions} />
    </div>
  )
}

export default function FinanceFeature() {
  return <FinanceContent />
}
