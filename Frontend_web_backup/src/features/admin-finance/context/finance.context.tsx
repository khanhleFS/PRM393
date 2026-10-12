import { useQuery } from '@tanstack/react-query'
import { fetchFinanceData } from '../services/admin-finance.service'
import type { FinanceContextValue } from '../types/admin-finance.types'

export function useFinance(): FinanceContextValue {
  const query = useQuery({
    queryKey: ['admin-finance'],
    queryFn: fetchFinanceData,
  })

  const data = query.data ?? null
  const isLoading = query.isPending
  const error = query.error instanceof Error ? query.error.message : null
  const refresh = () => {
    void query.refetch()
  }

  return { data, isLoading, error, refresh }
}
