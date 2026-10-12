import { useDashboard } from './context/dashboard.context'
import { DashboardSkeleton } from './components/dashboard-skeleton'
import {
  DashboardChartSection,
  DashboardTransactionsSection,
  DashboardUserPulseSection,
} from './components/dashboard-sections'

function DashboardContent() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return <DashboardSkeleton />
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <DashboardChartSection
        chartData={data.monthlyRevenueVnd}
        platformNet={data.platformRevenueVnd}
      />
      <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        <DashboardUserPulseSection
          totalUsers={data.totalUsers}
          totalAuthors={data.totalAuthors}
          totalNovels={data.totalNovels}
        />
        <DashboardTransactionsSection recentOrders={data.recentOrders} />
      </section>
    </div>
  )
}

export default function DashboardFeature() {
  return <DashboardContent />
}
