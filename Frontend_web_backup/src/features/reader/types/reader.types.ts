import type React from 'react'

// ─── Theme & Typography Types ────────────────────────────────────────────────

export type ThemeType = 'nocturne' | 'charcoal' | 'sepia' | 'ivory' | 'day'
export type FontType = 'serif' | 'sans' | 'mono'
export type LineHeightType = 'tight' | 'normal' | 'loose'

// ─── Chapter Data Models ─────────────────────────────────────────────────────

export interface ChapterSummary {
  id: number
  slug: string
  chapterNum: string
  title: string
}

export interface ChapterDetails {
  id: number
  chapterNumber?: number
  novelId: string
  title: string
  chapterNum: string
  author: string
  words: string
  readTime: string
  cover?: string
  paragraphs: string[]
  prevChapter: string | null
  nextChapter: string | null
  audioUrl: string | null
  novelTitle?: string
  chaptersList?: ChapterSummary[]
  isLocked?: boolean
  coinPrice?: number
}

// ─── Context Type ────────────────────────────────────────────────────────────

export interface ReaderContextType {
  currentChapterId: string
  setCurrentChapterId: (id: string) => void
  activeChapter: ChapterDetails | null
  isLoading: boolean
  scrollProgress: number
  setScrollProgress: (progress: number) => void
  savedBookmarkProgress: number
  reloadChapter: () => void
  
  // Reader settings
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  fontFamily: FontType
  setFontFamily: (font: FontType) => void
  fontSize: number
  setFontSize: (size: number) => void
  lineHeight: LineHeightType
  setLineHeight: (lineHeight: LineHeightType) => void
  fullFrame: boolean
  setFullFrame: (full: boolean) => void
}

// ─── Component Props Interfaces ──────────────────────────────────────────────

export interface FloatingAudioPlayerProps {
  novel?: string
  chapter?: string
  cover?: string
  isPlaying: boolean
  onPlayPause: () => void
  duration: number
  currentTime: number
  onSeek: (time: number) => void
  onPrevChapter: () => void
  onNextChapter: () => void
  hasPrevChapter: boolean
  hasNextChapter: boolean
  volume: number
  setVolume: (vol: number) => void
  isMuted: boolean
  onMuteToggle: () => void
  isGenerating: boolean
  onGenerateAudio: () => void
  audioUrl: string | null
  onClose: () => void
}

export interface ArticleProgressBarProps {
  targetRef: React.RefObject<HTMLElement | null>
}

export interface CanvasArticleProps {
  paragraphs: string[]
  fontSize: number
  fontFamily: string
  lineHeight: string
  textColor: string
  bgColor: string
}

export interface ReaderThemeStyle {
  bg: string
  pageBg: string
  text: string
  textMuted: string
  panelBg: string
  tagBg: string
}

export interface ReaderSuggestionsProps {
  currentTheme: ReaderThemeStyle
}

export interface ReaderConfigMenuProps {
  theme: ThemeType
  setTheme: (t: ThemeType) => void
  fontSize: number
  setFontSize: (s: number) => void
  fontFamily: FontType
  setFontFamily: (f: FontType) => void
  lineHeight: LineHeightType
  setLineHeight: (l: LineHeightType) => void
  fullFrame?: boolean
  setFullFrame?: (val: any) => void
  volume?: number
  setVolume?: (v: number) => void
}

export interface DockItemType {
  icon: React.ReactNode
  label: string
  onClick: () => void
  active?: boolean
  className?: string
}

export interface DockProps {
  items: DockItemType[]
  className?: string
  position?: 'bottom' | 'top'
  children?: React.ReactNode
}

export interface ChapterSelectorProps {
  position: 'top' | 'bottom'
  activeChap: ChapterDetails
  currentChapKey: string
  setCurrentChapKey: (key: string) => void
  activeSelector: 'top' | 'bottom' | null
  setActiveSelector: (selector: 'top' | 'bottom' | null) => void
  currentTheme: ReaderThemeStyle
}
