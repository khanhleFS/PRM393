import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  Settings,
  Bookmark,
  Share2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  AlignLeft,
  ArrowUp,
  Maximize2,
  Minimize2,
  Headphones,
  Volume2,
} from 'lucide-react'
import Dock from './dock'
import BookmarkModal from './bookmark-modal'
import FloatingAudioPlayer from './floating-audio-player'
import ReaderSuggestions from './reader-suggestions'
import ChapterSelector from './chapter-selector'
import ReaderConfigMenu from './reader-config-menu'
import { ReaderSkeleton } from './reader-skeleton'
import { useReaderContext } from '../context/reader-context'
import type { ThemeType, FontType, LineHeightType, ArticleProgressBarProps, CanvasArticleProps } from '../types/reader.types'
import { generateChapterAudio, readChapter, unlockChapter } from '@/services/chapter-service'
import { useAuthStore } from '@/store/auth.store'
import { extractId } from '../services/reader.service'

function ArticleProgressBar({ targetRef }: ArticleProgressBarProps) {
  const [element, setElement] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setElement(targetRef.current)
  }, [targetRef])

  const { scrollY } = useScroll()

  // Manually map the window scrollY to the article bounds to avoid
  // Framer Motion element-offset inversion bugs and static position warnings.
  const progress = useTransform(scrollY, (latestScrollY) => {
    if (!element) return 0
    const rect = element.getBoundingClientRect()
    // get absolute top relative to the document
    const elementTop = rect.top + latestScrollY
    const elementHeight = rect.height
    const viewportHeight = window.innerHeight

    // Start tracking when the top of the article hits the top of the viewport (offset by header)
    const startScroll = elementTop - 80
    // Finish tracking when the bottom of the article hits the bottom of the viewport
    const endScroll = elementTop + elementHeight - viewportHeight

    if (endScroll <= startScroll) {
      // Content is shorter than the viewport
      return latestScrollY > startScroll ? 1 : 0
    }

    const currentProgress = (latestScrollY - startScroll) / (endScroll - startScroll)
    return Math.max(0, Math.min(1, currentProgress))
  })

  if (!element) return null

  return (
    <motion.div
      className="progress_bar fixed top-0 left-0 right-0 h-1 bg-primary z-[60] shadow-[0_1px_6px_rgba(79,55,138,0.5)]"
      style={{
        scaleX: progress,
        scaleY: 1,
        transformOrigin: '0% 0% 0px',
        willChange: 'transform',
      }}
    />
  )
}

function CanvasArticle({ paragraphs, fontSize, fontFamily, lineHeight, textColor, bgColor }: CanvasArticleProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const draw = () => {
      console.log('[CanvasArticle] draw() called, container.clientWidth =', container.clientWidth)
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const fontStyle = `${fontSize}px ${fontFamily === 'serif' ? '"Georgia", "Merriweather", serif' : fontFamily === 'mono' ? 'monospace' : 'system-ui, sans-serif'}`
      const lhNum = fontSize * (lineHeight === 'tight' ? 1.5 : lineHeight === 'normal' ? 1.85 : 2.2)
      const padding = 16

      const parentWidth = container.clientWidth || 700
      const maxWidth = parentWidth - padding * 2

      ctx.font = fontStyle

      const lines: string[] = []
      paragraphs.forEach(p => {
        if (!p.trim()) {
          lines.push('')
          return
        }
        const words = p.split(' ')
        let currentLine = '    '
        for (let i = 0; i < words.length; i++) {
          const testLine = currentLine + words[i] + ' '
          if (ctx.measureText(testLine).width > maxWidth && i > 0) {
            lines.push(currentLine)
            currentLine = words[i] + ' '
          } else {
            currentLine = testLine
          }
        }
        lines.push(currentLine)
        lines.push('')
      })

      const dpr = window.devicePixelRatio || 1
      const totalHeight = lines.length * lhNum + padding * 2

      canvas.width = parentWidth * dpr
      canvas.height = totalHeight * dpr
      canvas.style.width = `${parentWidth}px`
      canvas.style.height = `${totalHeight}px`

      ctx.scale(dpr, dpr)

      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, parentWidth, totalHeight)

      ctx.font = fontStyle
      ctx.fillStyle = textColor
      ctx.textBaseline = 'top'

      lines.forEach((line, idx) => {
        if (line) {
          ctx.fillText(line.trimEnd(), padding, padding + idx * lhNum)
        }
      })
    }

    // Vẽ ngay lần đầu (mount / khi paragraphs, font, theme... đổi)
    draw()

    // Theo dõi trực tiếp kích thước của container — bắt được cả trường hợp
    // width đổi do CSS/class (vd toggle fullFrame) mà KHÔNG có prop nào của
    // component này thay đổi. ResizeObserver tự fire lại khi transition
    // width kết thúc nên không bị lệch canvas như cách cũ.
    const resizeObserver = new ResizeObserver((entries) => {
      console.log('[CanvasArticle] ResizeObserver fired, contentRect.width =', entries[0]?.contentRect.width)
      draw()
    })
    resizeObserver.observe(container)
    console.log('[CanvasArticle] ResizeObserver attached, initial clientWidth =', container.clientWidth)

    return () => resizeObserver.disconnect()
  }, [paragraphs, fontSize, fontFamily, lineHeight, textColor, bgColor])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && ['U', 'S'].includes(e.key.toUpperCase()))
      ) {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div
      ref={containerRef}
      className="w-full select-none"
      onContextMenu={e => e.preventDefault()}
      onSelectStart={e => e.preventDefault()}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <canvas ref={canvasRef} className="block w-full rounded-lg" />
    </div>
  )
}

function calculateArticleProgress(element: HTMLElement | null): number {
  if (!element) return 0
  const latestScrollY = window.scrollY || document.documentElement.scrollTop
  const rect = element.getBoundingClientRect()
  const elementTop = rect.top + latestScrollY
  const elementHeight = rect.height
  const viewportHeight = window.innerHeight

  const startScroll = elementTop - 80
  const endScroll = elementTop + elementHeight - viewportHeight

  if (endScroll <= startScroll) {
    return latestScrollY > startScroll ? 100 : 0
  }

  const currentProgress = (latestScrollY - startScroll) / (endScroll - startScroll)
  const clamped = Math.max(0, Math.min(1, currentProgress))
  return Math.round(clamped * 100)
}

function calculateScrollTopForProgress(element: HTMLElement | null, savedPercent: number): number {
  if (!element) return 0
  const latestScrollY = window.scrollY || document.documentElement.scrollTop
  const rect = element.getBoundingClientRect()
  const elementTop = rect.top + latestScrollY
  const elementHeight = rect.height
  const viewportHeight = window.innerHeight

  const startScroll = elementTop - 80
  const endScroll = elementTop + elementHeight - viewportHeight

  if (endScroll <= startScroll) {
    return startScroll
  }

  const ratio = Math.max(0, Math.min(100, savedPercent)) / 100
  return startScroll + ratio * (endScroll - startScroll)
}

function ReaderContent() {
  const navigate = useNavigate()
  const { novelSlugWithId } = useParams<{ novelSlugWithId: string }>()

  const {
    currentChapterId: currentChapKey,
    setCurrentChapterId: setCurrentChapKey,
    activeChapter: activeChap,
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
    setFullFrame,
  } = useReaderContext()

  const user = useAuthStore(s => s.user)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [isUnlocking, setIsUnlocking] = useState(false)

  // Ghi nhận đọc chương (tăng view và lưu lịch sử đọc)
  useEffect(() => {
    if (activeChap && !activeChap.isLocked && novelSlugWithId) {
      const novelId = extractId(novelSlugWithId)
      readChapter(novelId, activeChap.id).catch(err => {
        console.warn('Ghi nhận đọc chương thất bại:', err)
      })
    }
  }, [activeChap, novelSlugWithId])

  // Mở khóa chương truyện bằng coin
  const handleUnlock = async () => {
    if (!activeChap || isUnlocking || !novelSlugWithId) return
    setIsUnlocking(true)
    try {
      const novelId = extractId(novelSlugWithId)
      await unlockChapter(novelId, activeChap.id)
      alert('Mở khóa chương truyện thành công!')
      // Refresh user profile để cập nhật số dư coin mới
      await useAuthStore.getState().refreshProfile()
      // Tải lại chương truyện
      reloadChapter()
    } catch (err: any) {
      alert(err.message || 'Mở khóa chương truyện thất bại')
    } finally {
      setIsUnlocking(false)
    }
  }

  useEffect(() => {
    if (novelSlugWithId && currentChapKey) {
      navigate(`/${novelSlugWithId}/${currentChapKey}`, { replace: true })
    }
  }, [currentChapKey, novelSlugWithId, navigate])

  const [showSettings, setShowSettings] = useState(false)
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false)
  const [mobileOverlayActive, setMobileOverlayActive] = useState(false)
  const [showDock, setShowDock] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeSelector, setActiveSelector] = useState<'top' | 'bottom' | null>(null)
  const showDockRef = useRef(false)
  const scrollFrameRef = useRef<number | null>(null)

  // ── Audio Player State ──
  const [isAudioOpen, setIsAudioOpen] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Reset audio when active chapter changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    if (activeChap) {
      setCurrentAudioUrl(activeChap.audioUrl)
    }
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [activeChap])

  // Sync volume slider → audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  // Sync audio play state
  const handlePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.warn('Playback failed:', err)
      })
    }
  }

  const handleMuteToggle = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return
    setDuration(audioRef.current.duration)
  }

  // AI TTS Generation call
  const handleGenerateAudio = async () => {
    if (!activeChap || isGenerating) return
    setIsGenerating(true)
    try {
      // get novelId and chapterId (from activeChap.id = chapterNumber)
      const res = await generateChapterAudio(activeChap.novelId, activeChap.id)
      if (res && res.audioUrl) {
        setCurrentAudioUrl(res.audioUrl)
        // Automatically play when generated
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true)
            }).catch(e => console.warn(e))
          }
        }, 300)
      }
    } catch (err: any) {
      alert(err.message || 'Sinh giọng đọc thất bại. Vui lòng thử lại sau.')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const readingContainerRef = useRef<HTMLDivElement>(null)
  const articleContentRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const updateScrollState = () => {
      scrollFrameRef.current = null

      const winScroll = document.body.scrollTop || document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight

      let nextShowDock: boolean
      if (readingContainerRef.current) {
        const rect = readingContainerRef.current.getBoundingClientRect()
        nextShowDock = rect.top < 120 && rect.bottom > 220
      } else {
        const scrolled = height > 0 ? (winScroll / height) * 100 : 0
        nextShowDock = winScroll > 150 && scrolled < 92
      }

      if (nextShowDock !== showDockRef.current) {
        showDockRef.current = nextShowDock
        setShowDock(nextShowDock)
      }
    }

    const handleScroll = () => {
      if (scrollFrameRef.current !== null) {
        return
      }
      scrollFrameRef.current = window.requestAnimationFrame(updateScrollState)
    }

    updateScrollState()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollFrameRef.current)
      }
    }
  }, [currentChapKey])

  // Sync article scroll progress into ReaderContext using exact ArticleProgressBar math
  useEffect(() => {
    const updateArticleProgress = () => {
      if (articleContentRef.current) {
        const p = calculateArticleProgress(articleContentRef.current)
        setScrollProgress(p)
      }
    }

    window.addEventListener('scroll', updateArticleProgress, { passive: true })
    updateArticleProgress()
    return () => window.removeEventListener('scroll', updateArticleProgress)
  }, [setScrollProgress, activeChap])

  // Restore saved bookmark scroll position in article when chapter loads
  const hasRestoredBookmarkRef = useRef(false)

  useEffect(() => {
    hasRestoredBookmarkRef.current = false
  }, [currentChapKey])

  useEffect(() => {
    if (!activeChap || isLoading || hasRestoredBookmarkRef.current) return

    if (savedBookmarkProgress > 0) {
      hasRestoredBookmarkRef.current = true
      // Retry scroll restoration after DOM layout finishes rendering
      const timers = [100, 300, 600].map(delay =>
        setTimeout(() => {
          if (articleContentRef.current) {
            const targetY = calculateScrollTopForProgress(articleContentRef.current, savedBookmarkProgress)
            window.scrollTo({ top: targetY, behavior: 'smooth' })
          }
        }, delay)
      )
      return () => timers.forEach(clearTimeout)
    }
  }, [activeChap, isLoading, savedBookmarkProgress])

  useEffect(() => {
    if (!activeChap) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return
      }

      const key = e.key.toLowerCase()

      if (key === 'w' || e.key === 'ArrowUp') {
        e.preventDefault()
        window.scrollBy({ top: -180, behavior: 'smooth' })
      } else if (key === 's' || e.key === 'ArrowDown') {
        e.preventDefault()
        window.scrollBy({ top: 180, behavior: 'smooth' })
      } else if (key === 'a' || e.key === 'ArrowLeft') {
        if (activeChap.prevChapter) {
          e.preventDefault()
          setCurrentChapKey(activeChap.prevChapter)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else if (key === 'd' || e.key === 'ArrowRight') {
        if (activeChap.nextChapter) {
          e.preventDefault()
          setCurrentChapKey(activeChap.nextChapter)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentChapKey, activeChap])

  if (isLoading || !activeChap) {
    return <ReaderSkeleton />
  }

  const themeStyles = {
    nocturne: {
      bg: 'bg-[#151419] text-[#e6e1e7]',
      pageBg: '#0f0e11',
      text: 'text-[#e6e1e7]',
      textMuted: 'text-[#cac4d0]',
      panelBg: 'bg-[#1c1b1f]/95 border-white/10 text-[#e6e1e7]',
      tagBg: 'bg-[#d0bcff]/20 text-[#d0bcff]'
    },
    charcoal: {
      bg: 'bg-[#1e1e24] text-[#e3e1e6]',
      pageBg: '#16151a',
      text: 'text-[#e3e1e6]',
      textMuted: 'text-[#a5a4a9]',
      panelBg: 'bg-[#2a292f]/95 border-white/10 text-[#e3e1e6]',
      tagBg: 'bg-[#9a82db]/20 text-[#c2b2ec]'
    },
    sepia: {
      bg: 'bg-[#f4ebd4] text-[#4f3824]',
      pageBg: '#eae0ca',
      text: 'text-[#4f3824]',
      textMuted: 'text-[#8a6b51]',
      panelBg: 'bg-[#eae0ca]/95 border-[#d2b48c]/45 text-[#4f3824]',
      tagBg: 'bg-[#8b5a2b]/20 text-[#8b5a2b]'
    },
    ivory: {
      bg: 'bg-[#FAF5E6] text-[#2C2512]',
      pageBg: '#fcf9f2',
      text: 'text-[#2C2512]',
      textMuted: 'text-[#7c7152]',
      panelBg: 'bg-[#eae3cd]/95 border-black/10 text-[#2C2512]',
      tagBg: 'bg-[#7c7152]/10 text-[#7c7152]'
    },
    day: {
      bg: 'bg-[#ffffff] text-[#1c1b1f]',
      pageBg: '#f9f6fa',
      text: 'text-[#1c1b1f]',
      textMuted: 'text-[#49454f]',
      panelBg: 'bg-[#f3eff5]/95 border-black/10 text-[#1c1b1f]',
      tagBg: 'bg-[#4f378a]/10 text-[#4f378a]'
    }
  }

  const currentTheme = themeStyles[theme]

  const handleCanvasClick = () => {
    setMobileOverlayActive(prev => !prev)
  }

  const dockItems = [
    {
      icon: <ArrowLeft className="size-5 text-on-primary" />,
      label: 'Quay lại',
      onClick: () => navigate(`/${novelSlugWithId || ''}`)
    },
    {
      icon: <Bookmark className="size-5 text-on-primary" />,
      label: 'Đánh dấu',
      active: isBookmarkModalOpen,
      onClick: () => {
        if (isMobile) {
          setMobileOverlayActive(false)
        }
        setIsBookmarkModalOpen(prev => !prev)
      }
    },
    {
      icon: <Headphones className="size-5 text-on-primary" />,
      label: 'Giọng đọc',
      onClick: () => setIsAudioOpen(prev => !prev)
    },
    ...(isMobile ? [] : [
      {
        icon: fullFrame ? <Minimize2 className="size-5 text-on-primary" /> : <Maximize2 className="size-5 text-on-primary" />,
        label: fullFrame ? 'Khung chuẩn' : 'Tràn khung',
        onClick: () => setFullFrame(!fullFrame)
      }
    ]),
    {
      icon: <Settings className="size-5 text-on-primary" />,
      label: 'Cấu hình',
      onClick: () => {
        if (isMobile) {
          setMobileOverlayActive(false)
        }
        setShowSettings(prev => !prev)
      }
    }
  ]

  return (
    <div
      className="min-h-[calc(100vh-4rem)] sm:min-h-screen w-full mt-16 sm:mt-0 pt-0 sm:pt-24 transition-all duration-500 pb-28 relative"
      style={{ backgroundColor: currentTheme.pageBg }}
    >
      {/* Hidden audio element */}
      {currentAudioUrl && (
        <audio
          ref={audioRef}
          src={currentAudioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <ArticleProgressBar targetRef={articleContentRef} />

      <div className="w-full h-full">
        {/* Top Back Button — Outside reading card, aligned with reading container */}
        <div className={`mb-4 max-w-[780px] w-full sm:w-[95%] mx-auto px-4 sm:px-0 transition-all duration-300 ${fullFrame ? 'max-w-none px-4 sm:px-8' : ''}`}>
          <button
            onClick={() => navigate(`/${novelSlugWithId || ''}`)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer w-fit group hover:text-primary ${currentTheme.textMuted}`}
            style={{ borderColor: 'rgba(var(--current-text-color), 0.12)', backgroundColor: 'rgba(var(--current-text-color), 0.04)' }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang truyện</span>
          </button>
        </div>

        <div
          ref={readingContainerRef}
          className={`mx-auto transition-all duration-300 relative ${fullFrame
            ? 'w-full max-w-none rounded-none border-none p-4 sm:p-8 shadow-none'
            : 'max-w-[780px] w-full sm:w-[95%] rounded-none sm:rounded-2xl border-none sm:border-solid sm:border shadow-none sm:shadow-xl px-4 py-6 sm:p-10 sm:shadow-black/10'
            } ${currentTheme.bg}`}
          style={{ borderColor: 'rgba(var(--current-text-color), 0.1)', borderOpacity: 0.1 } as any}
        >
          <div className={`flex items-center flex-wrap gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold mb-8 select-none ${currentTheme.textMuted}`}>
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <span className="opacity-40">/</span>

            <Link to="/search" className="hover:text-primary transition-colors">Khám phá</Link>
            <span className="opacity-40">/</span>

            <span className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/${novelSlugWithId || ''}`)}>
              {activeChap.novelTitle || 'Tên Truyện'}
            </span>
            <span className="opacity-40">/</span>

            <span className="text-primary">{activeChap.chapterNum}</span>
          </div>

          <div className="flex flex-col items-center text-center mb-6">
            <span className="text-xs uppercase tracking-widest font-bold text-primary mb-3">
              {activeChap.chapterNum}
            </span>

            <h2 className={`font-serif text-3xl md:text-4xl font-bold leading-tight mb-4 ${currentTheme.text}`}>
              {activeChap.title}
            </h2>

            <div className={`flex items-center gap-3 text-xs font-semibold tracking-wide ${currentTheme.textMuted}`}>
              <span>
                By{' '}
                <Link
                  to={`/search?q=${encodeURIComponent(activeChap.author)}`}
                  className="hover:text-primary hover:underline underline-offset-4 transition-all"
                >
                  {activeChap.author}
                </Link>
              </span>
              <span className="w-1 h-1 bg-current opacity-30 rounded-full" />
              <span>{activeChap.readTime}</span>
              <span className="w-1 h-1 bg-current opacity-30 rounded-full" />
              <span>{activeChap.words}</span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-current opacity-10 my-6" />

          <div className="my-6">
            <ChapterSelector
              position="top"
              activeChap={activeChap}
              currentChapKey={currentChapKey}
              setCurrentChapKey={setCurrentChapKey}
              activeSelector={activeSelector}
              setActiveSelector={setActiveSelector}
              currentTheme={currentTheme}
            />
          </div>

          <div className="h-[1px] w-full bg-current opacity-10 my-6" />

          <main className="mx-auto space-y-8 my-8" onClick={handleCanvasClick} ref={articleContentRef as any}>
            {activeChap.isLocked ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-current/25 rounded-2xl bg-current/[0.02] text-center my-12 shadow-inner">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Chương truyện này đã bị khóa</h3>
                <p className="text-sm opacity-85 max-w-md mb-6">
                  Nội dung chương này yêu cầu trả phí để đọc. Vui lòng mở khóa để tiếp tục theo dõi truyện.
                </p>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-lg font-extrabold text-primary flex items-center gap-1.5 bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20">
                    Giá mở khóa: {activeChap.coinPrice} 🪙
                  </span>

                  {isAuthenticated ? (
                    <div className="flex flex-col items-center gap-2 mt-2">
                      <span className="text-xs opacity-75 font-semibold">Số dư của bạn: {user?.coinBalance ?? 0} 🪙</span>
                      {(user?.coinBalance ?? 0) >= (activeChap.coinPrice || 0) ? (
                        <button
                          onClick={handleUnlock}
                          disabled={isUnlocking}
                          className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-full cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
                        >
                          {isUnlocking ? 'Đang mở khóa...' : 'Mở khóa chương ngay'}
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2 mt-2">
                          <p className="text-xs text-red-500 font-bold">Số dư coin của bạn không đủ.</p>
                          <Link
                            to="/deposit"
                            className="px-8 py-3.5 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                          >
                            Nạp coin ngay
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                      className="px-8 py-3.5 bg-primary text-on-primary font-bold rounded-full cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
                    >
                      Đăng nhập để mở khóa
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <CanvasArticle
                paragraphs={activeChap.paragraphs}
                fontSize={fontSize}
                fontFamily={fontFamily}
                lineHeight={lineHeight}
                textColor={currentTheme.text.includes('#') ? currentTheme.text.replace('text-[', '').replace(']', '') : '#2c2c2c'}
                bgColor={currentTheme.bg.includes('#') ? currentTheme.bg.replace('bg-[', '').replace(']', '').split(' ')[0] : '#ffffff'}
              />
            )}
          </main>

          <div className="h-[1px] w-full bg-current opacity-10 my-6" />

          <div className="my-6">
            <ChapterSelector
              position="bottom"
              activeChap={activeChap}
              currentChapKey={currentChapKey}
              setCurrentChapKey={setCurrentChapKey}
              activeSelector={activeSelector}
              setActiveSelector={setActiveSelector}
              currentTheme={currentTheme}
            />
          </div>
        </div>

        {/* Quay lại trang truyện — Outside reading card, aligned with reading container */}
        <div className={`my-8 max-w-[780px] w-full sm:w-[95%] mx-auto px-4 sm:px-0 transition-all duration-300 ${fullFrame ? 'max-w-none px-4 sm:px-8' : ''}`}>
          <button
            onClick={() => navigate(`/${novelSlugWithId || ''}`)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer w-fit group hover:text-primary ${currentTheme.textMuted}`}
            style={{ borderColor: 'rgba(var(--current-text-color), 0.12)', backgroundColor: 'rgba(var(--current-text-color), 0.04)' }}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại trang truyện</span>
          </button>
        </div>

        <ReaderSuggestions currentTheme={currentTheme} />
      </div>

      <div className="hidden lg:block select-none">
        {activeChap.prevChapter && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.35, x: 0 }}
            whileHover={{ opacity: 1, x: 2, scale: 1.05 }}
            onClick={() => { setCurrentChapKey(activeChap.prevChapter!); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-20 rounded-xl flex items-center justify-center bg-current/[0.05] hover:bg-current/[0.08] border shadow-lg cursor-pointer ${currentTheme.text}`}
            style={{ borderColor: 'currentColor', borderOpacity: 0.1 } as any}
            title="Chương trước (Phím A / ←)"
          >
            <ChevronLeft className="h-8 w-8" />
          </motion.button>
        )}

        {activeChap.nextChapter && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 0.35, x: 0 }}
            whileHover={{ opacity: 1, x: -2, scale: 1.05 }}
            onClick={() => { setCurrentChapKey(activeChap.nextChapter!); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-20 rounded-xl flex items-center justify-center bg-current/[0.05] hover:bg-current/[0.08] border shadow-lg cursor-pointer ${currentTheme.text}`}
            style={{ borderColor: 'currentColor', borderOpacity: 0.1 } as any}
            title="Chương sau (Phím D / →)"
          >
            <ChevronRight className="h-8 w-8" />
          </motion.button>
        )}
      </div>

      <AnimatePresence>
        {
          showDock && (!isMobile || !mobileOverlayActive) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed bottom-6 left-0 right-0 flex justify-center z-[100] pointer-events-none"
            >
              <div className="pointer-events-auto">
                <Dock items={dockItems} position="bottom" />
              </div>
            </motion.div>
          )
        }
      </AnimatePresence>

      <AnimatePresence>
        {isAudioOpen && (
          <FloatingAudioPlayer
            chapter={activeChap.chapterNum}
            novel={activeChap.novelTitle}
            cover={activeChap.cover}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            duration={duration}
            currentTime={currentTime}
            onSeek={(time) => {
              if (audioRef.current) {
                audioRef.current.currentTime = time
                setCurrentTime(time)
              }
            }}
            onPrevChapter={() => {
              if (activeChap.prevChapter) {
                setCurrentChapKey(activeChap.prevChapter)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            onNextChapter={() => {
              if (activeChap.nextChapter) {
                setCurrentChapKey(activeChap.nextChapter)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            hasPrevChapter={!!activeChap.prevChapter}
            hasNextChapter={!!activeChap.nextChapter}
            volume={volume}
            setVolume={setVolume}
            isMuted={isMuted}
            onMuteToggle={handleMuteToggle}
            isGenerating={isGenerating}
            onGenerateAudio={handleGenerateAudio}
            audioUrl={currentAudioUrl}
            onClose={() => setIsAudioOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Bookmark Modal */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        novelSlugWithId={novelSlugWithId}
        activeChapter={activeChap}
        scrollProgress={scrollProgress}
        currentTheme={currentTheme}
      />

      <AnimatePresence>
        {
          showDock && (!isMobile || !mobileOverlayActive) && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              title="Lên đầu trang"
              className="fixed bottom-6 right-6 z-[95] md:bottom-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary text-on-primary shadow-lg shadow-primary/30 flex items-center justify-center cursor-pointer border border-white/10 hover:brightness-110 active:scale-95 transition-all"
            >
              <ArrowUp className="h-5 w-5" />
            </motion.button>
          )
        }
      </AnimatePresence>

      <AnimatePresence>
        {
          showSettings && !isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 cursor-pointer"
              onClick={() => setShowSettings(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: 'tween', duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-sm p-6 rounded-3xl border shadow-xl backdrop-blur-sm transform-gpu will-change-transform cursor-default ${currentTheme.panelBg}`}
              >
                <div className="space-y-5">
                  <ReaderConfigMenu
                    theme={theme} setTheme={setTheme}
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontFamily={fontFamily} setFontFamily={setFontFamily}
                    lineHeight={lineHeight} setLineHeight={setLineHeight}
                    fullFrame={fullFrame} setFullFrame={setFullFrame}
                    volume={volume} setVolume={setVolume}
                  />
                </div>
              </motion.div>
            </motion.div>
          )
        }
      </AnimatePresence>

      <AnimatePresence>
        {
          showSettings && isMobile && (
            <div className="fixed inset-0 z-[120] flex items-end justify-center md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 transition-opacity duration-200"
                onClick={() => setShowSettings(false)}
              />

              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                className={`relative w-full border-t border-outline/10 rounded-t-lg p-5 shadow-xl transform-gpu will-change-transform max-h-[80vh] overflow-y-auto z-10 ${currentTheme.panelBg}`}
              >
                <div className="w-12 h-1 bg-current opacity-20 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between pb-3 border-b border-outline/10 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Settings className="size-4 text-primary animate-spin-slow" />
                    <h2 className="font-serif text-sm font-bold">Cấu hình trình đọc</h2>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-[11px] font-bold uppercase tracking-wider text-primary hover:underline cursor-pointer select-none"
                  >
                    Đóng
                  </button>
                </div>

                <div className="space-y-5">
                  <ReaderConfigMenu
                    theme={theme} setTheme={setTheme}
                    fontSize={fontSize} setFontSize={setFontSize}
                    fontFamily={fontFamily} setFontFamily={setFontFamily}
                    lineHeight={lineHeight} setLineHeight={setLineHeight}
                    volume={volume} setVolume={setVolume}
                  />
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence>

      <div className="md:hidden select-none">
        <nav
          onClick={(e) => e.stopPropagation()}
          className={`fixed top-0 left-0 w-full z-50 bg-surface-container-low/95 backdrop-blur-md border-b border-outline/10 transition-all duration-300 py-3 ${mobileOverlayActive ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}
        >
          <div className="flex items-center justify-between px-4">
            <button onClick={() => navigate(`/${novelSlugWithId || ''}`)} className="p-2 hover:bg-surface-container rounded-full active:scale-90 transition-transform cursor-pointer">
              <ArrowLeft className="h-6 w-6 text-primary" />
            </button>
            <div className="text-center flex-1 max-w-[200px]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">LumiNovels</span>
              <h2 className="text-xs font-bold text-primary truncate">{activeChap.title}</h2>
            </div>
            <button onClick={() => alert('Bookmarked!')} className="p-2 hover:bg-surface-container rounded-full active:scale-90 transition-transform cursor-pointer">
              <Bookmark className="h-6 w-6 text-foreground" />
            </button>
          </div>
        </nav>

        <nav
          onClick={(e) => e.stopPropagation()}
          className={`fixed bottom-0 left-0 w-full z-50 bg-surface-container-low/95 backdrop-blur-xl border-t border-outline/10 p-5 rounded-t-2xl space-y-4 shadow-2xl transition-all duration-300 ${mobileOverlayActive ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
        >
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant">
              <span>Tiến độ cuộn trang</span>
              <span>{Math.round(scrollProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary origin-left" style={{ scaleX: scrollProgress / 100 }} />
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-on-surface-variant">
                  <span className="flex items-center gap-1"><AlignLeft className="h-3 w-3" /> Cỡ chữ</span>
                  <span className="text-primary font-bold">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-2 py-1 rounded-lg">
                  <span className="text-[9px] opacity-60">A</span>
                  <input
                    type="range"
                    min="14"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1 accent-primary h-1 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-bold opacity-80">A</span>
                </div>
              </div>

              <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline/5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant flex items-center gap-1">
                  <Volume2 className="h-3 w-3" /> Âm lượng
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full accent-primary h-1 bg-surface-container rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline/5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Kiểu chữ</span>
              <div className="flex justify-between items-center gap-2 bg-surface-container p-1 rounded-lg">
                {[
                  { id: 'serif', label: 'Serif' },
                  { id: 'sans', label: 'Sans' },
                  { id: 'mono', label: 'Mono' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id as FontType)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${fontFamily === f.id ? 'bg-primary border-primary text-on-primary shadow' : 'border-transparent text-on-surface-variant'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline/5 space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Giãn dòng</span>
              <div className="flex justify-between items-center gap-2 bg-surface-container p-1 rounded-lg">
                {[
                  { id: 'tight', label: 'Hẹp' },
                  { id: 'normal', label: 'Thường' },
                  { id: 'loose', label: 'Rộng' }
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLineHeight(l.id as LineHeightType)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all border cursor-pointer ${lineHeight === l.id ? 'bg-primary border-primary text-on-primary shadow' : 'border-transparent text-on-surface-variant'}`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline/5 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Tràn khung Full-screen</span>
              <button
                onClick={() => setFullFrame(!fullFrame)}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${fullFrame ? 'border-primary bg-primary/10 text-primary' : 'border-outline/10 text-on-surface-variant'}`}
              >
                {fullFrame ? 'Bật' : 'Tắt'}
              </button>
            </div>

            <div className="flex justify-between items-center gap-1.5 bg-surface-container-low p-2 rounded-xl border border-outline/5">
              {(['nocturne', 'charcoal', 'sepia', 'ivory', 'day'] as ThemeType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-transparent text-on-surface-variant'}`}
                >
                  {t === 'nocturne' ? 'Đêm' : t === 'charcoal' ? 'Than' : t === 'sepia' ? 'Kem' : t === 'ivory' ? 'Ngà' : 'Sáng'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-around items-center pt-2">
            <button onClick={() => alert('Đã đánh dấu chương này thành công!')} className="cursor-pointer hover:text-primary transition-colors p-2 rounded-full hover:bg-current/[0.04]" title="Đánh dấu">
              <Bookmark className="h-5 w-5 text-foreground" />
            </button>
            <button onClick={() => { setMobileOverlayActive(false); setShowSettings(true) }} className="cursor-pointer hover:text-primary transition-colors p-2 rounded-full hover:bg-current/[0.04]" title="Cấu hình">
              <Settings className="h-5 w-5 text-foreground" />
            </button>
            <button onClick={() => alert('Đã chia sẻ thành công!')} className="cursor-pointer hover:text-primary transition-colors p-2 rounded-full hover:bg-current/[0.04]" title="Chia sẻ">
              <Share2 className="h-5 w-5 text-foreground" />
            </button>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default ReaderContent