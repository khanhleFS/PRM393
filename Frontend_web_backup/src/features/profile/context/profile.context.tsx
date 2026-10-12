import { useQuery } from '@tanstack/react-query'
import type { ProfileContextValue } from '../types/profile.types'
import { fetchProfileData } from '../services/profile.service'

export function useProfile(): ProfileContextValue {
  const query = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfileData,
  })

  const data = query.data ?? null
  const isLoading = query.isPending
  const error = query.error instanceof Error ? query.error.message : null
  const refresh = () => {
    void query.refetch()
  }

  return { data, isLoading, error, refresh }
}
