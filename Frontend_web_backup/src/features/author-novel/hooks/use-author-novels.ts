import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getMyNovels,
  getNovelById,
  createNovel,
  updateNovel,
  deleteNovel
} from '@/services/novel-service'
import {
  getChaptersByNovel,
  getChapterDetails,
  createChapter,
  updateChapter,
  deleteChapter,
  generateChapterAudio
} from '@/services/chapter-service'
import type { NovelRequestDTO, NovelResponseDTO, ChapterRequestDTO, ChapterResponseDTO } from '@/types'

// Local mock database in memory to support CRUD preview when offline
const inMemoryNovels: NovelResponseDTO[] = [
  {
    id: 99991,
    title: "Vọng Âm Tòa Tháp Neon: Walker (Mock)",
    slug: "vong-am-toa-thap-neon-walker-1",
    description: "Trong những con phố ngập ánh đèn neon của Neo-Tokyo, Walker, một AI nổi loạn với những mảnh ký ức vụn vỡ về quá khứ con người, phải tìm cách định hướng trong mạng lưới gián điệp...",
    coverImageUrl: "https://placehold.co/400x600/E6E1E5/4F378A?text=Neon+Walker",
    status: "ONGOING",
    viewCount: 1250,
    chapterCount: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: "9999",
    authorName: "MockAuthor",
    categories: ["Cyberpunk", "Khoa học viễn tưởng"]
  }
]

const inMemoryChapters: Record<number, ChapterResponseDTO[]> = {
  99991: [
    {
      id: 999911,
      novelId: 99991,
      chapterNumber: 1,
      title: "Tia lửa đầu tiên (The First Spark)",
      slug: "chuong-1-tia-lua-dau-tien-1",
      content: "Nội dung chương 1 giả lập của Walker để phục vụ test UI...",
      audioUrl: null,
      status: "FREE",
      coinPrice: 0,
      viewCount: 100,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    },
    {
      id: 999912,
      novelId: 99991,
      chapterNumber: 2,
      title: "Tiếng vọng trong đêm",
      slug: "chuong-2-tieng-vong-trong-dem",
      content: "Nội dung chương 2 giả lập để test...",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      status: "LOCKED",
      coinPrice: 5,
      viewCount: 20,
      createdAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    }
  ]
}

// Query keys
export const authorNovelKeys = {
  all: ['author-novels'] as const,
  lists: () => [...authorNovelKeys.all, 'list'] as const,
  details: () => [...authorNovelKeys.all, 'detail'] as const,
  detail: (id: string) => [...authorNovelKeys.details(), id] as const,
  chapters: (novelId: string) => [...authorNovelKeys.all, 'chapters', novelId] as const,
  chapter: (novelId: string, chapterNumber: number) => [...authorNovelKeys.all, 'chapter', novelId, chapterNumber] as const,
}

export function useMyNovels() {
  return useQuery({
    queryKey: authorNovelKeys.lists(),
    queryFn: async () => {
      try {
        return await getMyNovels()
      } catch (err) {
        console.warn('API getMyNovels failed, falling back to mock data:', err)
        return inMemoryNovels
      }
    },
  })
}

export function useNovel(id: string | undefined) {
  return useQuery({
    queryKey: authorNovelKeys.detail(id || ''),
    queryFn: async () => {
      try {
        return await getNovelById(id!)
      } catch (err) {
        console.warn('API getNovelById failed, falling back to mock data:', err)
        const found = inMemoryNovels.find(n => String(n.id) === id)
        if (found) return found
        return {
          id: Number(id) || 99999,
          title: "Truyện mới (Mock)",
          slug: "truyen-moi-mock",
          description: "Mô tả truyện mới...",
          coverImageUrl: "",
          status: "ONGOING" as const,
          viewCount: 0,
          chapterCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authorId: "9999",
          authorName: "MockAuthor",
          categories: []
        }
      }
    },
    enabled: !!id,
  })
}

export function useCreateNovel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: NovelRequestDTO) => createNovel(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.lists() })
    },
  })
}

export function useUpdateNovel(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: NovelRequestDTO) => updateNovel(id, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.detail(id) })
    },
  })
}

export function useDeleteNovel() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteNovel(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.lists() })
    },
  })
}

export function useChapters(novelId: string | undefined) {
  return useQuery({
    queryKey: authorNovelKeys.chapters(novelId || ''),
    queryFn: async () => {
      try {
        return await getChaptersByNovel(novelId!)
      } catch (err) {
        console.warn('API getChaptersByNovel failed, falling back to mock data:', err)
        return inMemoryChapters[Number(novelId)] || []
      }
    },
    enabled: !!novelId,
  })
}

export function useChapterDetails(novelId: string | undefined, chapterNumber: number | undefined) {
  return useQuery({
    queryKey: authorNovelKeys.chapter(novelId || '', chapterNumber || 0),
    queryFn: async () => {
      try {
        const chaptersList = await getChaptersByNovel(novelId!)
        const targetChapter = chaptersList.find(c => c.chapterNumber === chapterNumber)
        if (!targetChapter) {
          throw new Error(`Không tìm thấy chương số ${chapterNumber}`)
        }
        return await getChapterDetails(novelId!, targetChapter.id)
      } catch (err) {
        console.warn('API getChapterDetails failed, falling back to mock data:', err)
        const list = inMemoryChapters[Number(novelId)] || []
        const found = list.find(c => c.chapterNumber === chapterNumber)
        if (found) return found
        return {
          id: 999900 + (chapterNumber || 0),
          novelId: Number(novelId) || 99991,
          chapterNumber: chapterNumber!,
          title: `Chương ${chapterNumber} (Mock)`,
          slug: `chuong-${chapterNumber}`,
          content: "Đây là nội dung chương giả lập để kiểm thử UI khi API bị lỗi.",
          audioUrl: null,
          status: "FREE" as const,
          coinPrice: 0,
          viewCount: 0,
          createdAt: new Date().toISOString(),
          updateAt: new Date().toISOString()
        }
      }
    },
    enabled: !!novelId && chapterNumber !== undefined && !isNaN(chapterNumber),
  })
}

export function useCreateChapter(novelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ChapterRequestDTO) => createChapter(novelId, request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapters(novelId) })
    },
  })
}

export function useUpdateChapter(novelId: string, chapterId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: ChapterRequestDTO) => updateChapter(novelId, chapterId, request),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapters(novelId) })
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapter(novelId, data.chapterNumber) })
    },
  })
}

export function useDeleteChapter(novelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chapterId: string) => deleteChapter(novelId, chapterId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapters(novelId) })
    },
  })
}

export function useGenerateChapterAudio(novelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (chapterNumber: number) => generateChapterAudio(novelId, chapterNumber),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapter(novelId, data.chapterNumber) })
      void queryClient.invalidateQueries({ queryKey: authorNovelKeys.chapters(novelId) })
    },
  })
}
