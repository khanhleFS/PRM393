import { getPublicNovelById } from '@/services/novel-service'
import { getChaptersByNovel } from '@/services/chapter-service'
import type { StoryDetailInfo, ChapterItem } from '../types/story-detail.types'

/** Extracts the numeric Long ID or UUID from the end of a slug-id string. */
export function extractId(slugWithId: string): string {
  if (!slugWithId) return ''
  const parts = slugWithId.split('-')
  if (parts.length >= 5) {
    const possibleUuid = parts.slice(-5).join('-')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (uuidRegex.test(possibleUuid)) {
      return possibleUuid
    }
  }
  const lastPart = parts[parts.length - 1]
  if (/^\d+$/.test(lastPart)) {
    return lastPart
  }
  return slugWithId
}

export const storyDetailService = {
  getStoryInfo: async (storyId: string): Promise<StoryDetailInfo> => {
    const id = extractId(storyId)
    const novel = await getPublicNovelById(id)
    return {
      id: String(novel.id),
      slug: `${novel.slug}-${novel.id}`,
      title: novel.title,
      author: novel.authorName || 'Tác giả',
      status: novel.status,
      chaptersCount: 0, // Will be updated by chapters length
      views: (novel.viewCount || 0).toString(),
      rating: 4.8,
      synopsis: novel.description ? novel.description.split('\n') : ['Chưa có mô tả.'],
      genres: novel.categories || [],
      cover: novel.coverImageUrl || undefined
    }
  },

  getStoryChapters: async (storyId: string): Promise<ChapterItem[]> => {
    const id = extractId(storyId)
    const chapters = await getChaptersByNovel(id)
    return chapters.map((c) => ({
      id: c.id,
      slug: `${c.slug}-${c.id}`,
      title: c.title,
      time: c.createdAt ? new Date(c.createdAt).toLocaleDateString('vi-VN') : 'Vừa xong',
      views: (c.viewCount || 0).toString(),
      isLocked: c.status === 'LOCKED',
      price: c.coinPrice > 0 ? c.coinPrice : undefined
    }))
  }
}
