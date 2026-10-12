import { Link } from 'react-router-dom'
import { BookOpen, Feather, Eye, Clock, Bookmark, Crown, ArrowRight } from 'lucide-react'
import SpotlightCard from '@/components/custom/spot-light-card/SpotlightCard'
import type { Story, SearchCardProps, UserReadState } from '../types/search.types'
export type { Story }

export function ReadingStoryCard({ story, userReadState }: SearchCardProps) {
  const bookmarkedChapterId = userReadState?.bookmarks[story.id]
  const bookmarkedChapterSlug = userReadState?.bookmarkSlugs?.[story.id]
  const unlockedChapterIds = userReadState?.unlockedChapters[story.id] ?? []
  const isBookmarked = !!bookmarkedChapterId

  const readProgress = bookmarkedChapterId
    ? Math.min(100, Math.round((bookmarkedChapterId / story.currentChapter) * 100))
    : 0

  const targetPath = isBookmarked
    ? (bookmarkedChapterSlug ? `/${story.slug}/${bookmarkedChapterSlug}` : `/${story.slug}/chapter/${bookmarkedChapterId}`)
    : `/${story.slug}`

  const metaParts: string[] = []
  if (isBookmarked) {
    metaParts.push(`Đang đọc Chap ${bookmarkedChapterId}/${story.currentChapter}`)
  } else {
    metaParts.push(`Đã mua ${unlockedChapterIds.length} chương`)
  }
  metaParts.push(`Tác giả: ${story.author}`)
  const metaString = metaParts.join(' • ')

  return (
    <Link
      to={targetPath}
      className="group flex w-full gap-4 rounded-md bg-surface-container p-3 text-left transition-colors hover:bg-surface-container-high border border-outline/5 shadow-sm"
    >
      <span className="h-[72px] w-12 shrink-0 overflow-hidden rounded-sm shadow-sm bg-surface-container-highest">
        {story.imgUrl ? (
          <img
            alt={story.title}
            className="h-full w-full object-cover"
            src={story.imgUrl}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = 'https://picsum.photos/seed/novel-cover/400/600'
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-primary/10">
            <BookOpen className="size-5 text-primary/30" />
          </div>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
          {story.title}
        </span>
        {isBookmarked && (
          <span className="mt-2 h-1 w-full bg-outline/15 rounded-full overflow-hidden">
            <span
              className="block h-full bg-primary transition-all duration-500"
              style={{ width: `${readProgress}%` }}
            />
          </span>
        )}
        <span className="mt-1.5 truncate text-[11px] font-semibold text-on-surface-variant">
          {metaString}
        </span>
      </span>
      {readProgress >= 100 && (
        <span className="self-center shrink-0">
          <Bookmark className="h-5 w-5 fill-primary text-primary" />
        </span>
      )}
    </Link>
  )
}

export function SearchCard({ story, userReadState }: SearchCardProps) {
  const bookmarkedChapterId = userReadState?.bookmarks[story.id]
  const bookmarkedChapterSlug = userReadState?.bookmarkSlugs?.[story.id]
  const unlockedChapterIds = userReadState?.unlockedChapters[story.id] ?? []
  const isBookmarked = !!bookmarkedChapterId
  const hasUnlocked = unlockedChapterIds.length > 0
  const hasReadingState = isBookmarked || hasUnlocked

  const readProgress = bookmarkedChapterId
    ? Math.min(100, Math.round((bookmarkedChapterId / story.currentChapter) * 100))
    : 0

  return (
    <SpotlightCard
      spotlightColor="rgba(79, 55, 138, 0.18)"
      className="rounded-md sm:rounded-lg bg-surface-container-low border border-outline/10 animate-fade-slide-up w-full overflow-hidden"
    >
      <div className="flex gap-2 sm:gap-6 p-2 sm:p-4 hover:bg-surface-container/50 transition-all group w-full min-w-0">
        {/* Book Cover */}
        <Link
          to={`/${story.slug}`}
          className="relative w-10 h-14 sm:w-28 sm:h-40 rounded sm:rounded-md bg-surface-container-highest overflow-hidden flex-shrink-0 shadow border border-outline/5 z-0 cursor-pointer block"
        >
          {story.imgUrl ? (
            <img
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              src={story.imgUrl}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = 'https://picsum.photos/seed/novel-cover/400/600'
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 via-surface-container-high to-surface-container-highest flex flex-col items-center justify-center p-0.5 transition-transform duration-500 group-hover:scale-105">
              <BookOpen className="size-3.5 sm:size-10 text-primary/30 mb-0.5 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-[5px] sm:text-[9px] text-on-surface-variant/30 font-semibold uppercase leading-none text-center">
                No Img
              </span>
            </div>
          )}
        </Link>

        {/* Story Details */}
        <div className="flex-grow py-0.5 flex flex-col justify-between overflow-hidden min-w-0">
          <div className="w-full h-full flex flex-col justify-center sm:justify-start">

            {/* DESKTOP LAYOUT */}
            <div className="hidden sm:block w-full">

              {/* Row 1: chips / badges */}
              {(story.status !== '' || isBookmarked || hasUnlocked) && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {story.status === 'Đang ra' && (
                    <span className="bg-primary text-on-primary text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider select-none">
                      Đang ra
                    </span>
                  )}
                  {story.status === 'Hoàn thành' && (
                    <span className="bg-tertiary text-on-tertiary text-[9px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider select-none">
                      Hoàn thành
                    </span>
                  )}
                  {isBookmarked && (
                    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Bookmark className="size-2.5 fill-primary" />
                      Đang đọc: Chap {bookmarkedChapterId}
                    </span>
                  )}
                  {hasUnlocked && (
                    <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary border border-secondary/20 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <Crown className="size-2.5 fill-secondary" />
                      {unlockedChapterIds.length} chương đã mua
                    </span>
                  )}
                </div>
              )}

              {/* Row 2: title (start) — chapter (end) */}
              <div className="flex items-baseline justify-between gap-4">
                <Link to={`/${story.slug}`} className="flex-grow min-w-0">
                  <h4 className="font-serif text-xl font-bold text-primary hover:underline leading-snug truncate line-clamp-1">
                    {story.title}
                  </h4>
                </Link>
                <span className="font-serif text-xl font-bold text-primary leading-snug shrink-0 select-none">
                  Ch. {story.currentChapter}
                </span>
              </div>

              {/* Row 3: categories (start) — views & time (end) */}
              <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex flex-wrap gap-1.5 select-none">
                  {story.genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="bg-surface-container-high text-on-surface-variant/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all group-hover:bg-primary/10 group-hover:text-primary"
                    >
                      {g}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2.5 text-xs text-on-surface-variant/80 font-medium whitespace-nowrap shrink-0 select-none">
                  <span className="flex items-center gap-1">
                    <Eye className="size-3.5 text-on-surface-variant/60" />
                    {story.reads}
                  </span>
                  <span className="text-outline/40">•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5 text-on-surface-variant/60" />
                    {story.publishTime}
                  </span>
                </div>
              </div>

              {/* Row 4: author */}
              <div className="border-t border-outline/8 mt-2.5 pt-2.5 flex items-center gap-1.5 text-sm text-on-surface-variant/75 font-medium select-none">
                <Feather className="size-3.5 text-primary/50 shrink-0" />
                <span>{story.author}</span>
              </div>

            </div>

            {/* daisyUI Collapse — chỉ hiện khi card có trạng thái đọc/mua (Desktop only) */}
            {hasReadingState && (
              <div className="hidden sm:block mt-3 -mx-4 -mb-4">
                <div className="collapse collapse-arrow border-t border-outline/10 bg-transparent rounded-none">
                  <input type="checkbox" />
                  <div className="collapse-title group flex items-center gap-2 text-xs font-bold text-on-surface-variant transition-colors hover:text-primary hover:bg-surface-container px-4 py-2 min-h-0">
                    <Bookmark className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
                    Tiến trình đọc
                  </div>
                  <div className="collapse-content px-4">
                    <div className="space-y-3 pt-1 pb-2">
                      {isBookmarked && (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider">Tiến trình</span>
                            <span className="text-xs text-primary font-bold">{readProgress}%</span>
                          </div>
                          <div className="h-1 w-full bg-outline/15 rounded-sm overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${readProgress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {isBookmarked && (
                          <Link
                            to={bookmarkedChapterSlug ? `/${story.slug}/${bookmarkedChapterSlug}` : `/${story.slug}/chapter/${bookmarkedChapterId}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold px-3 py-2 rounded-lg transition-all shadow-sm text-center"
                          >
                            <Bookmark className="size-3.5 fill-on-primary" />
                            Đọc tiếp Chap {bookmarkedChapterId}
                            <ArrowRight className="size-3.5" />
                          </Link>
                        )}
                        {hasUnlocked && (
                          <Link
                            to={`/${story.slug}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary text-xs font-bold px-3 py-2 rounded-lg transition-all text-center"
                          >
                            <Crown className="size-3.5" />
                            Tiếp tục mua chương
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* MOBILE LAYOUT */}
            <div className="flex sm:hidden flex-col gap-0.5 w-full justify-center">
              <div className="flex justify-between items-start gap-2 w-full">
                <Link to={`/${story.slug}`} className="flex-grow min-w-0">
                  <h4 className="font-serif text-[10px] font-bold text-primary hover:underline leading-tight truncate line-clamp-1">
                    {story.title}
                  </h4>
                </Link>
                <span className="font-serif text-[9px] font-bold text-primary shrink-0 whitespace-nowrap mt-0.5">
                  Ch. {story.currentChapter}
                </span>
              </div>

              <div className="text-[8px] text-on-surface-variant/80 font-medium flex items-center justify-between w-full select-none">
                <div className="flex items-center gap-0.5">
                  <Feather className="size-2 text-primary/60 shrink-0" />
                  <span>Tác giả: {story.author}</span>
                </div>
                {story.status === 'Đang ra' ? (
                  <span className="text-primary font-bold text-[7.5px] uppercase tracking-wider">Đang ra</span>
                ) : story.status === 'Hoàn thành' ? (
                  <span className="text-tertiary font-bold text-[7.5px] uppercase tracking-wider">Hoàn thành</span>
                ) : (
                  <span className="text-on-surface-variant/50 font-bold text-[7.5px] uppercase tracking-wider">{story.status}</span>
                )}
              </div>

              {/* Mobile badges */}
              {hasReadingState && (
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {isBookmarked && (
                    <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                      🔖 Chap {bookmarkedChapterId}
                    </span>
                  )}
                  {hasUnlocked && (
                    <span className="inline-flex items-center gap-0.5 bg-secondary/10 text-secondary text-[7px] font-bold px-1.5 py-0.5 rounded-full">
                      👑 {unlockedChapterIds.length} chương
                    </span>
                  )}
                </div>
              )}

              {/* Mobile progress bar */}
              {isBookmarked && (
                <div className="mt-1.5">
                  <div className="w-full bg-outline/15 h-1 rounded-sm overflow-hidden">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-500"
                      style={{ width: `${readProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}
