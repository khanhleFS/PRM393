import type React from 'react'
import type { UserReadState } from '@/services/mock-data'
import type { FilterGroup } from '@/services/filter-service'

export type { UserReadState }

export interface Story {
  id: string
  slug: string
  title: string
  reads: string
  publishTime: string
  author: string
  genres: string[]
  currentChapter: number
  status: string
  imgUrl?: string
}

export type ReadingStateFilter = 'all' | 'reading' | 'purchased'

export interface SearchContextType {
  searchQuery: string
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  selectedChapters: string
  setSelectedChapters: (chap: string) => void
  selectedStatus: string
  setSelectedStatus: (status: string) => void
  selectedReadingState: ReadingStateFilter
  setSelectedReadingState: (v: ReadingStateFilter) => void
  showUnlockedOnly: boolean
  setShowUnlockedOnly: (v: boolean) => void
  currentPage: number
  setCurrentPage: (page: number) => void
  filteredStories: Story[]
  pagedStories: Story[]
  isLoading: boolean
  categories: string[]
  filterGroups: FilterGroup[]
  isFiltersLoading: boolean
  clearFilters: () => void
  userReadState: UserReadState
  totalPages: number
  totalElements: number
}

export interface SearchCardProps {
  story: Story
  userReadState?: UserReadState
}

export interface SearchMobileFiltersProps {
  isOpen: boolean
  onClose: () => void
}

export interface SearchHeaderSectionProps {
  searchQuery: string
  isLoading: boolean
  filteredStoriesLength: number
  inputValue: string
  setInputValue: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  setIsMobileFilterOpen: (open: boolean) => void
  activeFiltersCount: number
  isFiltersLoading: boolean
  categories: string[]
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
}

export interface FilterGroupSkeletonProps {
  type?: 'pills' | 'grid-2' | 'grid-3'
}
