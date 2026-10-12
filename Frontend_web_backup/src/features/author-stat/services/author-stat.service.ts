import { getMyNovels, getNovelStats } from '@/services/novel-service'
import type { NovelResponseDTO } from '@/types'
import type { NovelStatSummary, AuthorNovelOption } from '../types/author-stat.types'

/**
 * Fetches all novels owned by the authenticated author for the dropdown selector.
 */
export async function fetchAuthorNovelsSummary(): Promise<AuthorNovelOption[]> {
  const novels: NovelResponseDTO[] = await getMyNovels()
  return novels.map((n) => ({
    id: String(n.id),
    title: n.title,
    coverImageUrl: n.coverImageUrl ?? undefined,
  }))
}

/**
 * Fetches chapter-level statistics for a specific novel from the backend.
 * Calls GET /author/novels/{id}/stats
 */
export async function fetchNovelStats(novelId: string): Promise<NovelStatSummary | null> {
  try {
    const data = await getNovelStats(novelId)
    // We need the novel title & cover — fetch from the novels list we already have cached
    const novels = await getMyNovels()
    const novel = novels.find((n) => String(n.id) === novelId)

    return {
      id: novelId,
      title: novel?.title ?? 'Truyện',
      coverImageUrl: novel?.coverImageUrl ?? undefined,
      totalViews: data.totalViews,
      totalRevenue: data.totalRevenue,
      avgConversionRate: data.avgConversionRate,
      chapters: data.chapters.map((ch) => ({
        chapterId: ch.chapterId,
        chapterNumber: ch.chapterNumber,
        title: ch.title,
        status: ch.status,
        viewCount: ch.viewCount,
        revenue: ch.revenue,
        conversionRate: ch.conversionRate,
      })),
    }
  } catch (err) {
    console.error('fetchNovelStats failed:', err)
    return null
  }
}
