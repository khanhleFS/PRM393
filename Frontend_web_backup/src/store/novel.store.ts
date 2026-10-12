import { create } from 'zustand'
import type { NovelResponseDTO } from '@/types'
import { searchNovels } from '@/services/novel-service'

interface NovelStoreState {
  topNovels: NovelResponseDTO[]
  isLoading: boolean
  lastFetched: number | null

  /** Fetch top N novels. Uses 5-min in-memory cache to avoid redundant API calls. */
  fetchTopNovels: (count?: number) => Promise<void>
}

export const useNovelStore = create<NovelStoreState>()((set, get) => ({
  topNovels: [],
  isLoading: false,
  lastFetched: null,

  async fetchTopNovels(count = 12) {
    const { isLoading, lastFetched, topNovels } = get()

    // Skip if already loading
    if (isLoading) return

    // Skip if cache is still fresh (5 minutes) and we already have enough novels
    const STALE_MS = 5 * 60 * 1000
    if (lastFetched && Date.now() - lastFetched < STALE_MS && topNovels.length >= count) return

    set({ isLoading: true })
    try {
      const result = await searchNovels({ page: 0, size: count })
      set({ topNovels: result.content, lastFetched: Date.now() })
    } catch (err) {
      console.warn('Failed to fetch top novels:', err)
    } finally {
      set({ isLoading: false })
    }
  },
}))
