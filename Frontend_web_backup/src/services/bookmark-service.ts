import { api } from '@/lib/api'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface BookmarkResponse {
  id: string
  novelId: string | number
  novelTitle: string
  novelSlug: string
  coverImageUrl: string | null
  authorName: string | null
  lastChapterId: string | number | null
  lastChapterNumber: number | null
  lastChapterTitle: string | null
  lastChapterSlug: string | null
  totalChapters: number
  isFavorite: boolean
  readingProgressPercent: number | null
  lastPage?: number | null
  createdAt: string
  updatedAt: string
}

export interface BookmarkRequest {
  novelId: string | number
  lastChapterId?: string | number | null
  readingProgressPercent?: number | null
  lastPage?: number | null
  isFavorite?: boolean | null
}

// ─── Service ────────────────────────────────────────────────────────────────

/**
 * Tạo mới hoặc cập nhật bookmark (upsert).
 * Dùng để: toggle yêu thích (isFavorite), lưu tiến độ đọc (lastChapterId, lastPage).
 */
export async function upsertBookmark(request: BookmarkRequest): Promise<BookmarkResponse> {
  const response = await api.post('/bookmarks', request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Lưu bookmark thất bại')
}

/**
 * Xóa bookmark của user cho một novel.
 */
export async function removeBookmark(novelId: string): Promise<void> {
  const response = await api.delete(`/bookmarks/${novelId}`)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Xóa bookmark thất bại')
}

/**
 * Lấy bookmark hiện tại của user cho một novel.
 * Trả về null nếu chưa bookmark.
 */
export async function getBookmark(novelId: string): Promise<BookmarkResponse | null> {
  try {
    const response = await api.get(`/bookmarks/${novelId}`)
    if (response.data && response.data.code === 200) {
      return response.data.result ?? null
    }
    return null
  } catch {
    // 404 or unauthenticated → no bookmark
    return null
  }
}

/**
 * Lấy toàn bộ danh sách bookmark của user hiện tại.
 */
export async function getMyBookmarks(): Promise<BookmarkResponse[]> {
  const response = await api.get('/bookmarks')
  if (response.data && response.data.code === 200) {
    return response.data.result ?? []
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách bookmark')
}
