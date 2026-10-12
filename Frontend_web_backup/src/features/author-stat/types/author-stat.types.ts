export interface ChapterStatItem {
  chapterId: number
  chapterNumber: number
  title: string
  viewCount: number
  revenue: number
  conversionRate: number
  status: string
}

export interface NovelStatSummary {
  id: string
  title: string
  coverImageUrl?: string
  totalViews: number
  totalRevenue: number
  avgConversionRate: number
  chapters: ChapterStatItem[]
}

export interface AuthorNovelOption {
  id: string
  title: string
  coverImageUrl?: string
}

export type StatTab = 'views' | 'revenue' | 'conversion'
