import { useEffect } from 'react'
import { useNovelStore } from '@/store/novel.store'

/**
 * Fetches the top N novels (sorted by viewCount desc) for use in any component.
 * Data is cached in the Zustand store for 5 minutes — multiple components can
 * call this hook without triggering duplicate API requests.
 */
export function useTopNovels(count = 8) {
  const { topNovels, isLoading, fetchTopNovels } = useNovelStore()

  useEffect(() => {
    fetchTopNovels(count)
  }, [count, fetchTopNovels])

  return {
    data: topNovels.slice(0, count),
    isLoading,
  }
}
