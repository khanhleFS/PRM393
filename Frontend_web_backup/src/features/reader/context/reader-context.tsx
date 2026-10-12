import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { readerService, extractId } from '../services/reader.service'
import type { ChapterDetails, ReaderContextType, ThemeType, FontType, LineHeightType } from '../types/reader.types'
import { upsertBookmark, getBookmark, type BookmarkResponse } from '@/services/bookmark-service'
import { useAuthStore } from '@/store/auth.store'
import { useThemeStore } from '@/store/theme.store'

const ReaderContext = createContext<ReaderContextType | undefined>(undefined)

export function ReaderProvider({ children, initialChapterId = 'chuong-1-tia-lua-dau-tien-1' }: { children: ReactNode, initialChapterId?: string }) {
  const { novelSlugWithId } = useParams<{ novelSlugWithId: string }>()
  const [currentChapterId, setCurrentChapterId] = useState<string>(initialChapterId)
  const [activeChapter, setActiveChapter] = useState<ChapterDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const reloadChapter = useCallback(() => {
    setRefreshTrigger(prev => prev + 1)
  }, [])

  // Bookmark state để lưu scroll position
  const bookmarkRef = useRef<BookmarkResponse | null>(null)
  const saveScrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync state when URL params change
  useEffect(() => {
    if (initialChapterId) {
      setCurrentChapterId(initialChapterId)
    }
  }, [initialChapterId])

  const { themeMode, setThemeMode } = useThemeStore()

  // Settings state
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined') {
      const isAppDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      const savedChoice = localStorage.getItem('reader-theme') as ThemeType | null
      
      if (savedChoice && ['nocturne', 'charcoal', 'sepia', 'ivory', 'day'].includes(savedChoice)) {
        const isSavedDark = savedChoice === 'nocturne' || savedChoice === 'charcoal'
        if (isAppDark === isSavedDark) {
          return savedChoice
        }
      }
      return isAppDark ? 'nocturne' : 'day'
    }
    return 'nocturne'
  })

  // 1. Global → Reader: when user toggles app dark/light mode, sync reader theme to match
  const themeRef = useRef(theme)
  themeRef.current = theme
  const prevThemeModeRef = useRef<string>(themeMode)
  useEffect(() => {
    if (prevThemeModeRef.current === themeMode) return
    prevThemeModeRef.current = themeMode

    const isAppDark = themeMode === 'dark' || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const isCurrentDark = themeRef.current === 'nocturne' || themeRef.current === 'charcoal'

    if (isAppDark && !isCurrentDark) {
      setTheme('nocturne')
    } else if (!isAppDark && isCurrentDark) {
      setTheme('day')
    }
  }, [themeMode])

  const [fontFamily, setFontFamily] = useState<FontType>('serif')
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState<LineHeightType>('normal')
  const [fullFrame, setFullFrame] = useState(false)

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isAuthLoading = useAuthStore(s => s.isLoading)

  const [savedBookmarkProgress, setSavedBookmarkProgress] = useState(0)

  // Fetch chapter + restore scroll position từ bookmark
  useEffect(() => {
    if (isAuthLoading) return

    setIsLoading(true)
    setScrollProgress(0)
    setSavedBookmarkProgress(0)

    readerService.getChapter(currentChapterId, novelSlugWithId).then(async chapter => {
      setActiveChapter(chapter)

      if (isAuthenticated && novelSlugWithId) {
        try {
          const novelId = extractId(novelSlugWithId)
          const chapterId = extractId(currentChapterId)
          const existing = await getBookmark(novelId)
          bookmarkRef.current = existing

          if (existing) {
            if (existing.lastChapterId != null && String(existing.lastChapterId) !== String(chapterId)) {
              await upsertBookmark({ novelId, lastChapterId: chapterId || null, readingProgressPercent: 0, lastPage: 0 })
              setSavedBookmarkProgress(0)
            } else {
              const savedPercent = existing.readingProgressPercent ?? existing.lastPage ?? 0
              setSavedBookmarkProgress(savedPercent)
              setScrollProgress(savedPercent)
            }
          }
        } catch (err) {
          console.warn('Could not sync reading progress:', err)
        }
      }
      setIsLoading(false)
    }).catch(error => {
      console.error('Failed to load chapter', error)
      setIsLoading(false)
    })
  }, [currentChapterId, novelSlugWithId, isAuthenticated, isAuthLoading, refreshTrigger])

  // Debounced scroll listener — lưu vị trí scroll (từ article) vào bookmark mỗi 1.5 giây
  const scrollProgressRef = useRef(scrollProgress)
  scrollProgressRef.current = scrollProgress

  useEffect(() => {
    if (!isAuthenticated || !novelSlugWithId || !bookmarkRef.current) return

    if (saveScrollTimerRef.current) clearTimeout(saveScrollTimerRef.current)
    saveScrollTimerRef.current = setTimeout(async () => {
      try {
        const novelId = extractId(novelSlugWithId)
        const chapterId = extractId(currentChapterId)
        await upsertBookmark({
          novelId,
          lastChapterId: chapterId || null,
          readingProgressPercent: scrollProgressRef.current,
          lastPage: scrollProgressRef.current,
        })
      } catch (err) {
        console.warn('Could not save scroll position:', err)
      }
    }, 1500)
  }, [scrollProgress, isAuthenticated, novelSlugWithId, currentChapterId])

  // 2. Reader → Global: when user picks a theme inside Reader Config, sync app mode to match
  const themeModeRef = useRef(themeMode)
  themeModeRef.current = themeMode
  useEffect(() => {
    localStorage.setItem('reader-theme', theme)
    const isDarkTheme = theme === 'nocturne' || theme === 'charcoal'

    if (isDarkTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Only update global themeMode if the dark/light polarity actually differs (avoids loop)
    const isAppDark = themeModeRef.current === 'dark' || (themeModeRef.current === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    if (isDarkTheme !== isAppDark) {
      setThemeMode(isDarkTheme ? 'dark' : 'light')
    }
  }, [theme, setThemeMode])

  return (
    <ReaderContext.Provider value={{
      currentChapterId,
      setCurrentChapterId,
      activeChapter,
      isLoading,
      scrollProgress,
      setScrollProgress,
      savedBookmarkProgress,
      reloadChapter,
      theme,
      setTheme,
      fontFamily,
      setFontFamily,
      fontSize,
      setFontSize,
      lineHeight,
      setLineHeight,
      fullFrame,
      setFullFrame
    }}>
      {children}
    </ReaderContext.Provider>
  )
}

export function useReaderContext() {
  const context = useContext(ReaderContext)
  if (!context) {
    throw new Error('useReaderContext must be used within a ReaderProvider')
  }
  return context
}
