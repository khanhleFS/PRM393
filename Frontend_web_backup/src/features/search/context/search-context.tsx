import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { searchService, type FilterGroup, type FilterOption } from '../services/search.service'
import type { Story, SearchContextType, ReadingStateFilter, UserReadState } from '../types/search.types'
import { useQuery } from '@tanstack/react-query'
import { getMyBookmarks } from '@/services/bookmark-service'
import { useAuthStore } from '@/store/auth.store'

export type { UserReadState, ReadingStateFilter }

const ITEMS_PER_PAGE = 5

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  const [selectedCategory, setSelectedCategoryRaw] = useState('Tất cả thể loại')
  const [selectedChapters, setSelectedChaptersRaw] = useState('Any')
  const [selectedStatus, setSelectedStatusRaw] = useState('All')
  const [selectedReadingState, setSelectedReadingStateRaw] = useState<ReadingStateFilter>('all')
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: realBookmarks = [] } = useQuery({
    queryKey: ['myBookmarks'],
    queryFn: getMyBookmarks,
    enabled: isAuthenticated,
  })

  const userReadState = useMemo<UserReadState>(() => {
    if (!isAuthenticated) {
      return {
        bookmarks: {},
        bookmarkSlugs: {},
        unlockedChapters: {}
      }
    }

    const bookmarks: Record<string, number> = {}
    const bookmarkSlugs: Record<string, string> = {}

    realBookmarks.forEach((b) => {
      if (b.novelId && b.lastChapterNumber != null) {
        bookmarks[b.novelId] = b.lastChapterNumber
        if (b.lastChapterSlug) {
          bookmarkSlugs[b.novelId] = b.lastChapterSlug
        }
      }
    })

    return {
      bookmarks,
      bookmarkSlugs,
      unlockedChapters: {}
    }
  }, [realBookmarks, isAuthenticated])

  // Reset page to 1 whenever filter changes
  const setSelectedCategory = (cat: string) => { setSelectedCategoryRaw(cat); setCurrentPage(1) }
  const setSelectedChapters = (chap: string) => { setSelectedChaptersRaw(chap); setCurrentPage(1) }
  const setSelectedStatus = (status: string) => { setSelectedStatusRaw(status); setCurrentPage(1) }
  const setSelectedReadingState = (v: ReadingStateFilter) => { setSelectedReadingStateRaw(v); setCurrentPage(1) }

  const clearFilters = () => {
    setSelectedCategoryRaw('Tất cả thể loại')
    setSelectedChaptersRaw('Any')
    setSelectedStatusRaw('All')
    setSelectedReadingStateRaw('all')
    setShowUnlockedOnly(false)
    setCurrentPage(1)
  }

  // Load filter groups once on mount
  const { data: filterGroups = [], isLoading: isFiltersLoading } = useQuery<FilterGroup[]>({
    queryKey: ['searchFilters'],
    queryFn: searchService.getSearchFilters,
  })

  // Load categories from backend (real API)
  const { data: categories = [] } = useQuery<string[]>({
    queryKey: ['searchCategories'],
    queryFn: searchService.getCategories,
    staleTime: 5 * 60 * 1000, // cache 5 min
  })

  // Load novel status options from backend (dynamic enum)
  const { data: novelStatuses = [] } = useQuery<FilterOption[]>({
    queryKey: ['novelStatuses'],
    queryFn: searchService.getNovelStatuses,
    staleTime: 10 * 60 * 1000,
  })

  // Load chapter range options from backend (dynamic enum)
  const { data: chapterRanges = [] } = useQuery<FilterOption[]>({
    queryKey: ['chapterRanges'],
    queryFn: searchService.getChapterRanges,
    staleTime: 10 * 60 * 1000,
  })

  const mergedFilterGroups = useMemo(() => {
    return filterGroups.map(group => {
      if (group.id === 'category' && categories.length > 0) {
        return {
          ...group,
          options: categories.map(cat => ({
            label: cat,
            value: cat
          }))
        }
      }
      if (group.id === 'status' && novelStatuses.length > 0) {
        return { ...group, options: novelStatuses }
      }
      if (group.id === 'chapters' && chapterRanges.length > 0) {
        return { ...group, options: chapterRanges }
      }
      return group
    })
  }, [filterGroups, categories, novelStatuses, chapterRanges])

  // Fetch all matching stories once per filter combo (no page param — client handles paging)
  const { data: storyResult, isLoading } = useQuery({
    queryKey: ['stories', searchQuery, selectedCategory, selectedChapters, selectedStatus],
    queryFn: () => searchService.getStories({
      searchQuery,
      category: selectedCategory,
      minChapters: selectedChapters,
      status: selectedStatus,
      page: 0,
      size: 100, // fetch up to 100 at once, client paginates
    })
  })

  const allStories = storyResult?.stories ?? []
  const totalElements = storyResult?.totalElements ?? 0

  // Apply client-side reading state filter (reading / purchased / show-unlocked-only)
  const filteredStories = useMemo(() => {
    let result = allStories

    if (selectedReadingState === 'reading') {
      result = result.filter(s => !!userReadState.bookmarks[s.id])
    } else if (selectedReadingState === 'purchased') {
      result = result.filter(s => (userReadState.unlockedChapters[s.id] ?? []).length > 0)
    } else if (showUnlockedOnly) {
      result = result.filter(s => (userReadState.unlockedChapters[s.id] ?? []).length > 0)
    }

    return result
  }, [allStories, selectedReadingState, showUnlockedOnly, userReadState])

  // Client-side pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / ITEMS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedStories = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE
    return filteredStories.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredStories, safePage])

  return (
    <SearchContext.Provider value={{
      searchQuery,
      selectedCategory,
      setSelectedCategory,
      selectedChapters,
      setSelectedChapters,
      selectedStatus,
      setSelectedStatus,
      selectedReadingState,
      setSelectedReadingState,
      showUnlockedOnly,
      setShowUnlockedOnly,
      currentPage: safePage,
      setCurrentPage,
      filteredStories,
      pagedStories,
      isLoading,
      categories,
      filterGroups: mergedFilterGroups,
      isFiltersLoading,
      clearFilters,
      userReadState,
      totalPages,
      totalElements,
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearchContext() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}

