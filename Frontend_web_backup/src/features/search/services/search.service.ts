import type { Story } from '../types/search.types'
import { searchNovels, getPublicNovelEnums } from '@/services/novel-service'
import { filterService, type FilterGroup, type FilterOption } from '@/services/filter-service'
import { getAllCategories } from '@/services/category-service'

export type { FilterGroup, FilterOption }

// Map backend enum names → Vietnamese display labels
const STATUS_DISPLAY_MAP: Record<string, string> = {
  ONGOING: 'Đang ra',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
  PAUSED: 'Tạm dừng',
  DROPPED: 'Drop',
}

export const searchService = {
  getStories: async (params: {
    searchQuery?: string
    category?: string
    minChapters?: string
    status?: string
    page?: number
    size?: number
  }): Promise<{ stories: Story[]; totalPages: number; totalElements: number }> => {
    const backendStatus = params.status && params.status !== 'All'
      ? params.status
      : undefined

    const minChaptersNum = params.minChapters && params.minChapters !== 'Any'
      ? parseInt(params.minChapters, 10)
      : undefined

    const result = await searchNovels({
      q: params.searchQuery,
      category: params.category && params.category !== 'Tất cả thể loại' ? params.category : undefined,
      status: backendStatus,
      minChapters: minChaptersNum,
      page: params.page ?? 0,
      size: params.size ?? 20,
    })

    const stories: Story[] = result.content.map((novel) => ({
      id: novel.id,
      slug: `${novel.slug}-${novel.id}`,
      title: novel.title,
      reads: (novel.viewCount || 0).toString(),
      publishTime: novel.createdAt
        ? new Date(novel.createdAt).toLocaleDateString('vi-VN')
        : 'Vừa xong',
      author: novel.authorName || 'Tác giả',
      genres: novel.categories || [],
      currentChapter: novel.chapterCount ?? 0,
      status: STATUS_DISPLAY_MAP[novel.status] ?? novel.status,
      imgUrl: novel.coverImageUrl || undefined,
    }))

    return {
      stories,
      totalPages: result.totalPages,
      totalElements: result.totalElements,
    }
  },

  getCategories: async (): Promise<string[]> => {
    try {
      const cats = await getAllCategories()
      return ['Tất cả thể loại', ...cats.map(c => c.name)]
    } catch {
      return ['Tất cả thể loại']
    }
  },

  getNovelStatuses: async (): Promise<FilterOption[]> => {
    try {
      const enums = await getPublicNovelEnums()
      const novelStatusEnum = enums.find(e => e.name === 'NovelStatus')
      if (!novelStatusEnum) return getDefaultStatusOptions()

      return [
        { label: 'Tất cả', value: 'All' },
        ...novelStatusEnum.value.map(v => ({
          label: STATUS_DISPLAY_MAP[v] ?? v,
          value: v,
        }))
      ]
    } catch {
      return getDefaultStatusOptions()
    }
  },

  getChapterRanges: async (): Promise<FilterOption[]> => {
    try {
      const enums = await getPublicNovelEnums()
      const rangeEnum = enums.find(e => e.name === 'ChapterRange')
      if (!rangeEnum) return getDefaultChapterOptions()

      return [
        { label: 'Tất cả', value: 'Any' },
        ...rangeEnum.value.map(v => ({
          label: `${v}+ chương`,
          value: v,
        }))
      ]
    } catch {
      return getDefaultChapterOptions()
    }
  },

  getSearchFilters: (): Promise<FilterGroup[]> => {
    return filterService.getFiltersByScope('search')
  }
}

function getDefaultStatusOptions(): FilterOption[] {
  return [
    { label: 'Tất cả', value: 'All' },
    { label: 'Đang ra', value: 'ONGOING' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Đã huỷ', value: 'CANCELLED' },
  ]
}

function getDefaultChapterOptions(): FilterOption[] {
  return [
    { label: 'Tất cả', value: 'Any' },
    { label: '5+ chương', value: '5' },
    { label: '10+ chương', value: '10' },
    { label: '20+ chương', value: '20' },
    { label: '50+ chương', value: '50' },
  ]
}
