import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Heart, Trash2, X, Check, BookOpen, LogIn, Loader2, Library, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { getBookmark, upsertBookmark, removeBookmark, getMyBookmarks, type BookmarkResponse } from '@/services/bookmark-service'
import { extractId } from '../services/reader.service'
import type { ChapterDetails, ReaderThemeStyle } from '../types/reader.types'

interface BookmarkModalProps {
  isOpen: boolean
  onClose: () => void
  novelSlugWithId?: string
  activeChapter: ChapterDetails | null
  scrollProgress: number
  currentTheme?: ReaderThemeStyle
}

export function truncateTitle(title?: string | null, maxWords = 3): string {
  if (!title) return ''
  const words = title.trim().split(/\s+/)
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...'
  }
  return title
}

export default function BookmarkModal({
  isOpen,
  onClose,
  novelSlugWithId,
  activeChapter,
  scrollProgress,
}: BookmarkModalProps) {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [bookmark, setBookmark] = useState<BookmarkResponse | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [otherBookmarks, setOtherBookmarks] = useState<BookmarkResponse[]>([])
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const novelId = novelSlugWithId ? extractId(novelSlugWithId) : ''
  const currentChapterIdStr = activeChapter?.id ? String(activeChapter.id) : null

  const fetchBookmarkData = useCallback(async () => {
    if (!isAuthenticated || !novelId) return
    setIsLoading(true)
    try {
      const [currentBm, allBms] = await Promise.all([
        getBookmark(novelId),
        getMyBookmarks().catch(() => []),
      ])
      setBookmark(currentBm)
      setIsFavorite(currentBm?.isFavorite ?? false)

      // Lọc các bookmark khác: Tối thiểu phải khác chương (hoặc khác truyện)
      const currentExtractNovelId = extractId(novelId)

      const filteredOtherBms = allBms.filter(b => {
        // 1. Kiểm tra xem có cùng truyện hay không
        const bExtractNovelId = extractId(b.novelId)
        const isSameNovel =
          b.novelId === novelId ||
          (bExtractNovelId !== '' && bExtractNovelId === currentExtractNovelId) ||
          (novelSlugWithId && (b.novelSlug === novelSlugWithId || b.novelId === novelSlugWithId))

        if (!isSameNovel) return true // Khác truyện → giữ lại

        // 2. Nếu cùng truyện, kiểm tra xem có cùng chương hay không
        if (!activeChapter) return false

        const bChapNum = b.lastChapterNumber != null ? Number(b.lastChapterNumber) : null
        const activeChapNum = activeChapter.chapterNumber != null
          ? Number(activeChapter.chapterNumber)
          : (typeof activeChapter.id === 'number' ? activeChapter.id : Number(activeChapter.id))

        const isSameChapterNumber =
          bChapNum !== null &&
          !isNaN(bChapNum) &&
          activeChapNum !== null &&
          !isNaN(activeChapNum) &&
          bChapNum === activeChapNum

        const activeIdStr = String(activeChapter.id)
        const activeExtractId = extractId(activeIdStr)

        const isSameChapterId =
          (b.lastChapterId != null && (String(b.lastChapterId) === activeIdStr || (activeExtractId !== '' && extractId(String(b.lastChapterId)) === activeExtractId))) ||
          (b.lastChapterSlug != null && (String(b.lastChapterSlug) === activeIdStr || (activeExtractId !== '' && extractId(String(b.lastChapterSlug)) === activeExtractId)))

        const isSameChapter = isSameChapterNumber || isSameChapterId

        // Nếu cùng chương → loại bỏ (!isSameChapter = false)
        return !isSameChapter
      })
      setOtherBookmarks(filteredOtherBms)
    } catch (err) {
      console.warn('Failed to fetch bookmark data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, novelId, novelSlugWithId, activeChapter])

  useEffect(() => {
    if (isOpen) {
      setToast(null)
      fetchBookmarkData()
    }
  }, [isOpen, fetchBookmarkData])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveProgress = async () => {
    if (!novelId || !currentChapterIdStr) return
    setIsSaving(true)
    try {
      const progressVal = Math.round(scrollProgress)
      const updated = await upsertBookmark({
        novelId,
        lastChapterId: currentChapterIdStr,
        readingProgressPercent: progressVal,
        lastPage: progressVal,
        isFavorite,
      })
      setBookmark(updated)
      showToast('success', 'Đã lưu tiến độ đọc thành công!')
    } catch (err: any) {
      showToast('error', err.message || 'Lưu tiến độ đọc thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!novelId) return
    const nextFavorite = !isFavorite
    setIsSaving(true)
    try {
      const progressVal = bookmark?.readingProgressPercent ?? bookmark?.lastPage ?? Math.round(scrollProgress)
      const updated = await upsertBookmark({
        novelId,
        lastChapterId: bookmark?.lastChapterId || currentChapterIdStr,
        readingProgressPercent: progressVal,
        lastPage: progressVal,
        isFavorite: nextFavorite,
      })
      setBookmark(updated)
      setIsFavorite(nextFavorite)
      showToast(
        'success',
        nextFavorite ? 'Đã thêm truyện vào danh sách yêu thích!' : 'Đã bỏ yêu thích'
      )
    } catch (err: any) {
      showToast('error', err.message || 'Cập nhật trạng thái thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!novelId) return
    if (!confirm('Bạn có chắc chắn muốn xóa đánh dấu truyện này khỏi tủ sách?')) return
    setIsSaving(true)
    try {
      await removeBookmark(novelId)
      setBookmark(null)
      setIsFavorite(false)
      showToast('success', 'Đã xóa đánh dấu khỏi tủ sách!')
    } catch (err: any) {
      showToast('error', err.message || 'Xóa đánh dấu thất bại')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative w-full max-w-lg bg-surface-container-high border border-outline/20 rounded-3xl shadow-2xl overflow-hidden z-10 text-on-surface"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline/10 bg-surface-container/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Đánh dấu đọc sách</h3>
                  <p className="text-xs text-outline font-medium">Quản lý bookmark & tiến độ đọc</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface hover:bg-surface-container-highest transition-colors text-outline hover:text-on-surface cursor-pointer"
                title="Đóng modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Toast Message */}
              <AnimatePresence>
                {toast && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${toast.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                  >
                    {toast.type === 'success' ? (
                      <Check className="w-4 h-4 shrink-0 text-emerald-500" />
                    ) : (
                      <X className="w-4 h-4 shrink-0 text-rose-500" />
                    )}
                    <span>{toast.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {!isAuthenticated ? (
                /* Unauthenticated View */
                <div className="text-center py-6 px-4 bg-surface/50 rounded-2xl border border-outline/10 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">Bạn chưa đăng nhập</h4>
                    <p className="text-xs text-outline max-w-xs mx-auto">
                      Vui lòng đăng nhập tài khoản để lưu bookmark và tự động đồng bộ tiến độ đọc trên mọi thiết bị.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-bold text-sm rounded-full shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập ngay</span>
                  </button>
                </div>
              ) : isLoading ? (
                /* Loading State */
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-outline">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-xs font-medium">Đang tải thông tin đánh dấu...</span>
                </div>
              ) : (
                /* Authenticated Content */
                <>
                  {/* Single Unified Card: Novel Info + Heart/Trash Icons + Progress Bar + Save Button */}
                  <div className="p-4 rounded-lg bg-surface-container/70 border border-outline/15 shadow-sm space-y-4">
                    {/* Header Row: Novel Title, Heart & Trash Icons */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0 pr-2">
                        <h4 className="font-extrabold text-lg sm:text-xl line-clamp-1 text-on-surface">
                          {truncateTitle(activeChapter?.novelTitle, 3) || 'Tên Truyện'}
                        </h4>
                      </div>

                      {/* Icon Yêu Thích & Xóa */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Heart Icon Button */}
                        <button
                          onClick={handleToggleFavorite}
                          disabled={isSaving}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${isFavorite
                            ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 hover:bg-rose-500/25'
                            : 'bg-surface/80 text-outline border-outline/20 hover:text-rose-500 hover:border-rose-500/30'
                            }`}
                          title={isFavorite ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>

                        {/* Trash Icon Button */}
                        {bookmark && (
                          <button
                            onClick={handleRemove}
                            disabled={isSaving}
                            className="w-9 h-9 rounded-xl bg-surface/80 text-outline hover:text-rose-500 hover:bg-rose-500/15 hover:border-rose-500/30 border border-outline/20 flex items-center justify-center transition-all cursor-pointer"
                            title="Xóa đánh dấu"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] w-full bg-outline/10" />

                    {/* Tiến độ (Reading Progress Bar) - Chapter title replaces label */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-outline font-bold line-clamp-1 flex-1 pr-2">
                          {activeChapter?.title || 'Tiến độ đọc'}
                        </span>
                        <span className="font-bold text-primary text-sm shrink-0">{Math.round(scrollProgress)}%</span>
                      </div>

                      <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 rounded-full"
                          style={{ width: `${Math.max(3, Math.min(100, scrollProgress))}%` }}
                        />
                      </div>
                    </div>

                    {/* Nút lưu / cập nhật tiến độ */}
                    <button
                      onClick={handleSaveProgress}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      <span>
                        {bookmark ? 'Cập nhật tiến độ đọc hiện tại' : 'Lưu bookmark chương này'}
                      </span>
                    </button>
                  </div>

                  {/* 3. Một số bookmark khác (Other Bookmarks) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-outline uppercase tracking-wider">
                        <Library className="w-3.5 h-3.5 text-primary" />
                        <span>Một số bookmark khác</span>
                      </div>
                      <button
                        onClick={() => {
                          onClose()
                          navigate('/profile')
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Tủ sách</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {otherBookmarks.length === 0 ? (
                      <div className="text-center py-4 px-3 rounded-2xl bg-surface/30 border border-outline/10 text-outline text-xs">
                        Chưa có bookmark nào khác trong tủ sách của bạn.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {otherBookmarks.slice(0, 4).map(item => (
                          <div
                            key={item.id}
                            onClick={() => {
                              onClose()
                              const targetUrl = item.lastChapterSlug && item.novelSlug
                                ? `/${item.novelSlug}/${item.lastChapterSlug}`
                                : item.novelSlug
                                  ? `/${item.novelSlug}`
                                  : `/${item.novelId}`
                              navigate(targetUrl)
                            }}
                            className="p-3 rounded-xl bg-surface/50 hover:bg-surface-container-highest border border-outline/10 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                          >
                            <div className="min-w-0 flex-1">
                              <h5 className="font-semibold text-xs text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                                {truncateTitle(item.novelTitle, 3)}
                              </h5>
                              <p className="text-[11px] text-outline line-clamp-1">
                                {item.lastChapterTitle || (item.lastChapterNumber ? `Chương ${item.lastChapterNumber}` : 'Chưa đọc')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                {item.readingProgressPercent ?? item.lastPage ?? 0}%
                              </span>
                              <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
