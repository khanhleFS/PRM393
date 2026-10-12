export type ChapterStatus = 'UNLOCKED' | 'LOCKED' | 'FREE'

export interface ChapterResponseDTO {
  id: number
  novelId: number
  chapterNumber: number
  title: string
  slug: string
  content: string
  encryptedData?: string
  iv?: string
  audioUrl: string | null
  status: ChapterStatus
  coinPrice: number
  viewCount: number
  createdAt: string
  updateAt: string
}

export interface ChapterRequestDTO {
  title: string
  content: string
  status: ChapterStatus
  chapterNumber: number
  coinPrice: number
}
