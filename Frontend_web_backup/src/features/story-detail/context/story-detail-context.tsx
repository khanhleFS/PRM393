import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { storyDetailService, extractId } from '../services/story-detail.service'
import type { StoryDetailInfo, ChapterItem, StoryDetailContextType } from '../types/story-detail.types'
import { getBookmark, upsertBookmark, removeBookmark } from '@/services/bookmark-service'
import { useAuthStore } from '@/store/auth.store'
import { useErrorHandler } from '@/lib/error-handler'

const StoryDetailContext = createContext<StoryDetailContextType | undefined>(undefined)

export function StoryDetailProvider({ children, storyId }: { children: ReactNode, storyId: string }) {
  const { addToast } = useErrorHandler()
  const [storyInfo, setStoryInfo] = useState<StoryDetailInfo | null>(null)
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const [inLibrary, setInLibrary] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isSortedAsc, setIsSortedAsc] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // Load story info + chapters
  useEffect(() => {
    setIsLoading(true)
    Promise.all([
      storyDetailService.getStoryInfo(storyId),
      storyDetailService.getStoryChapters(storyId)
    ]).then(([info, chaps]) => {
      setStoryInfo(info)
      setChapters(chaps)
      setIsLoading(false)
    }).catch(error => {
      console.error("Failed to load story details", error)
      setIsLoading(false)
    })
  }, [storyId])

  // Load bookmark state from API (only when authenticated)
  useEffect(() => {
    if (!isAuthenticated) {
      setInLibrary(false)
      setIsFavorite(false)
      return
    }
    const novelId = extractId(storyId)
    if (!novelId) return

    getBookmark(novelId).then(bookmark => {
      if (bookmark) {
        setInLibrary(true)
        setIsFavorite(bookmark.isFavorite ?? false)
      } else {
        setInLibrary(false)
        setIsFavorite(false)
      }
    }).catch(() => {
      setInLibrary(false)
      setIsFavorite(false)
    })
  }, [storyId, isAuthenticated])

  // Toggle bookmark (add / remove from library)
  const toggleLibrary = useCallback(async () => {
    if (!isAuthenticated) {
      addToast({
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập để lưu truyện vào danh sách yêu thích.',
        variant: 'warning'
      })
      return
    }

    const novelId = extractId(storyId)
    if (!novelId) return

    if (inLibrary) {
      // Xóa bookmark
      try {
        await removeBookmark(novelId)
        setInLibrary(false)
        setIsFavorite(false)
      } catch (err) {
        console.error('Failed to remove bookmark', err)
      }
    } else {
      // Tạo bookmark mới với isFavorite = true
      try {
        await upsertBookmark({ novelId, isFavorite: true })
        setInLibrary(true)
        setIsFavorite(true)
      } catch (err) {
        console.error('Failed to add bookmark', err)
      }
    }
  }, [isAuthenticated, storyId, inLibrary])

  const toggleSort = () => {
    setChapters(prev => [...prev].reverse())
    setIsSortedAsc(prev => !prev)
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(chapters.length / itemsPerPage)
  const paginatedChapters = chapters.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <StoryDetailContext.Provider value={{
      storyId,
      storyInfo,
      chapters,
      isLoading,
      inLibrary,
      isFavorite,
      toggleLibrary,
      isSortedAsc,
      toggleSort,
      currentPage,
      setCurrentPage,
      itemsPerPage,
      totalPages,
      paginatedChapters
    }}>
      {children}
    </StoryDetailContext.Provider>
  )
}

export function useStoryDetailContext() {
  const context = useContext(StoryDetailContext)
  if (!context) {
    throw new Error('useStoryDetailContext must be used within a StoryDetailProvider')
  }
  return context
}
