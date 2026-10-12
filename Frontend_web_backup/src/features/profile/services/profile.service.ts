import { api } from '@/lib/api'
import type { ProfileDTO, ResetPasswordRequestDTO } from '@/types'
import type { ProfileData, CollectionItem, CollectionStory } from '../types/profile.types'
import { getMyBookmarks } from '@/services/bookmark-service'


/**
 * Fetches the current user's profile data from the Backend.
 */
export async function fetchProfileData(): Promise<ProfileData> {
  const response = await api.get('/profile')
  if (response.data && response.data.code === 200) {
    const profile = response.data.result

    // Load bookmark collections
    let collections: CollectionItem[] = []
    try {
      const bookmarks = await getMyBookmarks()

      const toStory = (b: typeof bookmarks[0], hideProgress: boolean): CollectionStory => {
        // Đối với danh mục Đang đọc, progress = b.readingProgressPercent (vị trí cuộn trang % trong chapter)
        const progress = hideProgress ? 0 : (b.readingProgressPercent ?? b.lastPage ?? 0)

        // Nếu là tab Đang đọc và có chapter slug, trỏ trực tiếp tới chapter. Ngược lại trỏ tới novel details
        const targetPath = (!hideProgress && b.lastChapterSlug)
          ? `/${b.novelSlug}-${b.novelId}/${b.lastChapterSlug}`
          : `/${b.novelSlug}-${b.novelId}`

        // Thiết lập meta text mô tả vị trí cuộn trang hiện tại
        let metaText = `${b.totalChapters} chương`
        if (!hideProgress && b.lastChapterNumber != null) {
          metaText = `Chương ${b.lastChapterNumber}`
        }

        return {
          id: b.id,
          novelId: String(b.novelId),
          title: b.novelTitle,
          meta: metaText,
          progress,
          path: targetPath,
          coverUrl: b.coverImageUrl || 'https://placehold.co/48x72/1C1B1F/E6E1E5?text=Novel',
          hideProgress,
        }
      }

      const favorites = bookmarks.filter(b => b.isFavorite)
      const reading = bookmarks.filter(b => b.lastChapterNumber != null)

      collections = [
        {
          key: 'bookmarks',
          label: 'Yêu thích',
          stories: favorites.map(b => toStory(b, true)), // Ẩn progress
        },
        {
          key: 'reading-list',
          label: 'Đang đọc',
          stories: reading.map(b => toStory(b, false)), // Hiện progress & dẫn tới chapter
        },
      ]
    } catch (err) {
      console.warn('Could not load bookmark collections:', err)
    }

    return {
      user: {
        id: profile.id || 'usr-001',
        displayName: profile.fullName || '',
        username: profile.username || profile.email || '',
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || 'https://placehold.co/300x300/E6E1E5/4F378A?text=Avatar',
        memberSince: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Thành viên mới',
        isVerified: true,
      },
      wallet: {
        balance: profile.coinBalance || 0,
        currency: 'Lumi Coins',
      },
      transactions: [],
      collections,
    }
  }
  throw new Error(response.data?.message || 'Không thể tải thông tin cá nhân')
}

/**
 * Updates the current authenticated user's profile info.
 */
export async function updateProfile(request: ProfileDTO): Promise<void> {
  const response = await api.put('/profile', request)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Cập nhật thông tin thất bại')
}

/**
 * Resets the password using old and new password.
 */
export async function resetPassword(request: ResetPasswordRequestDTO): Promise<void> {
  const response = await api.post('/auth/reset-password', request)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Đổi mật khẩu thất bại')
}

/**
 * Fetches current user's coin package transaction history.
 */
export async function getCoinTransactions(page = 0, size = 20) {
  const response = await api.get(`/profile/transactions?page=${page}&size=${size}`)
  if (response.data && response.data.code === 200) {
    const result = response.data.result
    return Array.isArray(result) ? result : result?.content || []
  }
  throw new Error(response.data?.message || 'Không thể tải lịch sử giao dịch coin')
}
