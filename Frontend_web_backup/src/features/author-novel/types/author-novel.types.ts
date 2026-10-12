import type { NovelResponseDTO, ChapterResponseDTO } from '@/types'

export interface NovelFormProps {
  novel?: NovelResponseDTO
}

export interface ChapterListProps {
  novelId: string
}

export interface ChapterFormProps {
  novelId: string
  chapter?: ChapterResponseDTO
  existingChapterNumbers?: number[]
}
