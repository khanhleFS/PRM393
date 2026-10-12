import { useQuery } from '@tanstack/react-query'
import { fetchDashboardData } from '../services/dashboard.service'
import type { DashboardContextValue } from '../types/admin-dashboard.types'

export function useDashboard(): DashboardContextValue {
  const query = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchDashboardData,
  })

  const data = query.data ?? null
  const isLoading = query.isPending
  const error = query.error instanceof Error ? query.error.message : null
  const refresh = () => {
    void query.refetch()
  }

  return { data, isLoading, error, refresh }
}
