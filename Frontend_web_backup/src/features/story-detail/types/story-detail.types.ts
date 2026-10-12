export interface StoryDetailInfo {
  id: string
  slug: string
  title: string
  author: string
  status: string
  chaptersCount: number
  views: string
  rating: number
  synopsis: string[]
  genres: string[]
  cover?: string
}

export interface ChapterItem {
  id: number | string
  slug: string
  title: string
  time: string
  views: string
  isLocked?: boolean
  price?: number
}

export interface StoryDetailContextType {
  storyId: string
  storyInfo: StoryDetailInfo | null
  chapters: ChapterItem[]
  isLoading: boolean

  // Library states
  inLibrary: boolean
  isFavorite: boolean
  toggleLibrary: () => void

  // Chapter list states
  isSortedAsc: boolean
  toggleSort: () => void
  currentPage: number
  setCurrentPage: (page: number | ((p: number) => number)) => void
  itemsPerPage: number
  totalPages: number
  paginatedChapters: ChapterItem[]
}

export interface StoryBannerProps {
  inLibrary: boolean
  onLibraryToggle: () => void
  onScrollToChapters: () => void
}

export interface StoryChaptersProps {
  storySlug: string
  chaptersLength: number
  paginatedChapters: ChapterItem[]
  currentPage: number
  totalPages: number
  isSortedAsc: boolean
  onSortToggle: () => void
  onPageChange: (page: number | ((p: number) => number)) => void
}
