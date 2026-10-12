import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react'
import type { ChapterSelectorProps } from '../types/reader.types'

export default function ChapterSelector({
  position,
  activeChap,
  currentChapKey,
  setCurrentChapKey,
  activeSelector,
  setActiveSelector,
  currentTheme
}: ChapterSelectorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const isHovered = useRef(false)
  const isOpen = activeSelector === position

  // Dropdown portal position
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({})

  // Recalculate position whenever isOpen flips to true
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    if (position === 'top') {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: rect.width,
        zIndex: 9999,
      })
    } else {
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left + rect.width / 2,
        transform: 'translateX(-50%)',
        minWidth: rect.width,
        zIndex: 9999,
      })
    }
  }, [isOpen, position])
  // 👉 THÊM VÀO ĐÂY: Lock page scroll while dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const lenis = (window as any).lenis

    const originalBody = document.body.style.overflow
    const originalHtml = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    lenis?.stop()

    return () => {
      document.body.style.overflow = originalBody
      document.documentElement.style.overflow = originalHtml
      lenis?.start()
    }
  }, [isOpen])

  // 👉 THÊM VÀO ĐÂY (tuỳ chọn, cho mobile): chặn touchmove ngoài list
  useEffect(() => {
    if (!isOpen) return
    const handleTouchMove = (e: TouchEvent) => {
      if (listRef.current && e.target instanceof Node && listRef.current.contains(e.target)) {
        return
      }
      e.preventDefault()
    }
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    return () => document.removeEventListener('touchmove', handleTouchMove)
  }, [isOpen])

  // Single hover-tracking handler on the center wrapper (covers trigger + dropdown gap)
  const handleMouseEnter = () => { isHovered.current = true }
  const handleMouseLeave = () => { isHovered.current = false }

  // When selector is open and user is hovering anywhere over it (trigger OR list),
  // block page scroll and forward wheel delta into the dropdown list.
  // Must be non-passive so preventDefault() actually works.
  useEffect(() => {
    if (!isOpen) return
    const handleWheel = (e: WheelEvent) => {
      if (!isHovered.current) return
      e.preventDefault()
      if (listRef.current) {
        listRef.current.scrollTop += e.deltaY
      }
    }
    document.addEventListener('wheel', handleWheel, { passive: false })
    return () => document.removeEventListener('wheel', handleWheel)
  }, [isOpen])

  // Close when page scrolls while selector is open (and user is not hovering it)
  useEffect(() => {
    if (!isOpen) return
    const handleScroll = (e: Event) => {
      if (isHovered.current) return
      setActiveSelector(null)
    }
    window.addEventListener('scroll', handleScroll, { capture: true })
    return () => window.removeEventListener('scroll', handleScroll, { capture: true })
  }, [isOpen, setActiveSelector])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveSelector(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, setActiveSelector])

  return (
    <div
      ref={wrapperRef}
      className={`flex items-stretch select-none gap-[2px] max-w-[260px] w-full mx-auto ${position === 'top' ? 'mb-8' : 'mt-12'}`}
    >
      {/* Prev chapter button */}
      <button
        disabled={!activeChap.prevChapter}
        onClick={() => {
          if (activeChap.prevChapter) {
            setCurrentChapKey(activeChap.prevChapter)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        className="px-3 py-2 rounded-s-[50px] rounded-e-[10px] bg-primary text-on-primary shadow hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
        title="Chương trước"
      >
        <ChevronLeft className="h-4.5 w-4.5" />
      </button>

      {/* Center: trigger + dropdown — single hover wrapper covers both */}
      <div
        ref={triggerRef}
        className="flex-1 min-w-0 relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => setActiveSelector((prev: any) => prev === position ? null : position)}
          className="w-full h-full bg-primary text-on-primary shadow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center px-2 py-2 text-xs font-bold font-sans outline-none cursor-pointer gap-1.5"
          style={{ borderRadius: '4px' }}
        >
          <span className="truncate">{activeChap.chapterNum}</span>
          <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Backdrop — fullscreen, closes on click outside */}
        {isOpen && (
          <div
            className="fixed inset-0 cursor-default"
            style={{ zIndex: 9998 }}
            onClick={(e) => {
              e.stopPropagation()
              setActiveSelector(null)
            }}
          />
        )}

        {/* Dropdown portal — renders directly into body to escape stacking contexts */}
        {isOpen && activeChap.chaptersList && createPortal(
          <div
            ref={listRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={dropdownStyle}
            className={`w-max max-h-60 overflow-y-auto ${currentTheme.bg} border border-current/10 rounded-[10px] shadow-2xl py-1 flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
            {activeChap.chaptersList.map((chap) => (
              <button
                key={chap.id}
                onClick={() => {
                  setCurrentChapKey(chap.slug)
                  setActiveSelector(null)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-bold font-sans hover:bg-current/[0.08] cursor-pointer transition-colors ${currentChapKey === chap.slug ? 'text-primary bg-primary/10' : currentTheme.text}`}
              >
                {chap.title}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>

      {/* Next chapter button */}
      <button
        disabled={!activeChap.nextChapter}
        onClick={() => {
          if (activeChap.nextChapter) {
            setCurrentChapKey(activeChap.nextChapter)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
        }}
        className="px-3 py-2 rounded-s-[10px] rounded-e-[50px] bg-primary text-on-primary shadow hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center cursor-pointer"
        title="Chương sau"
      >
        <ChevronRight className="h-4.5 w-4.5" />
      </button>
    </div>
  )
}
