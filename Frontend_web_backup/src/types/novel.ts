export type NovelStatus = 'ONGOING' | 'COMPLETED' | 'PAUSED' | 'DROPPED'

export interface NovelResponseDTO {
  id: number
  title: string
  slug: string
  description: string
  coverImageUrl: string | null
  status: NovelStatus
  viewCount: number
  chapterCount: number
  createdAt: string
  updatedAt: string
  authorId: string
  authorName: string
  categories: string[]
  unlockedChapterIds?: number[]
}

export interface NovelPageResponseDTO {
  content: NovelResponseDTO[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface NovelRequestDTO {
  title: string
  description: string
  coverImageUrl: string
  status: NovelStatus
  categoryIds: string[]
}

