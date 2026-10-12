import { BookOpen, Bookmark, BookmarkCheck } from 'lucide-react'
import { useStoryDetailContext } from '../context/story-detail-context'
import type { StoryBannerProps } from '../types/story-detail.types'

const COVER_PLACEHOLDER = 'https://placehold.co/400x600/1a1a1a/ededed?text=Cover'

export function StoryBanner({ inLibrary, onLibraryToggle, onScrollToChapters }: StoryBannerProps) {
  const { storyInfo } = useStoryDetailContext()

  if (!storyInfo) return null

  const displayCover = storyInfo.cover || COVER_PLACEHOLDER

  return (
    <>
      {/* --- DESKTOP VIEWPORT --- */}
      <section className="hidden md:block relative w-full h-[480px] overflow-hidden rounded-3xl border border-outline/10 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent z-10" />
        <img
          alt="Backdrop"
          className="w-full h-full object-cover opacity-25 scale-105 blur-xl"
          src={displayCover}
        />
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="w-full px-8 pb-8 flex flex-col md:flex-row gap-8 items-end">
            {/* Book Cover */}
            <div className="w-full md:w-[240px] aspect-[2/3] shrink-0 rounded-md overflow-hidden shadow-2xl border border-outline/10 transform hover:scale-[1.02] duration-500">
              <img
                alt={storyInfo.title}
                className="w-full h-full object-cover"
                src={displayCover}
              />
            </div>

            {/* Cover Details */}
            <div className="flex-grow space-y-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {storyInfo.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full text-xs font-semibold">
                    {genre}
                  </span>
                ))}
                <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant rounded-full text-xs font-semibold border border-outline/10">
                  {storyInfo.status === 'Ongoing' ? 'Chưa kết thúc' : 'Kết thúc'}
                </span>
              </div>
              <h1 className="font-serif text-5xl font-bold leading-tight drop-shadow-md">
                {storyInfo.title}
              </h1>
              <p className="text-xl font-serif text-on-surface opacity-90 italic font-medium">Tác giả: {storyInfo.author}</p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={onScrollToChapters}
                  className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  <BookOpen className="h-4 w-4" />
                  Đọc ngay
                </button>
                <button
                  onClick={onLibraryToggle}
                  className={`px-6 py-3 rounded-full font-bold border flex items-center gap-2 transition-all cursor-pointer ${inLibrary ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-container-high border-outline/20 text-foreground hover:bg-surface-bright'}`}
                >
                  {inLibrary ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Đã lưu
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-4 w-4" />
                      Lưu truyện
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MOBILE VIEWPORT --- */}
      <div className="md:hidden flex flex-col gap-8 relative pt-4">
        {/* Mobile Cover Banner */}
        <section className="relative w-full aspect-[3/4] overflow-hidden rounded-xl border border-outline/10 shadow-lg">
          <img
            alt={storyInfo.title}
            className="w-full h-full object-cover"
            src={displayCover}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

          {/* Mobile Cover Content */}
          <div className="absolute bottom-6 left-4 right-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {storyInfo.genres.map((genre) => (
                <span key={genre} className="px-2 py-0.5 bg-primary-container text-on-primary-container rounded-full text-[10px] font-semibold">
                  {genre}
                </span>
              ))}
              <span className="px-2 py-0.5 bg-surface-container-highest/80 text-on-surface-variant rounded-full text-[10px] font-semibold border border-outline/10">
                {storyInfo.status === 'Ongoing' ? 'Chưa kết thúc' : 'Kết thúc'}
              </span>
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-3xl font-bold text-foreground leading-tight drop-shadow-md">
                {storyInfo.title}
              </h2>
              <p className="text-sm font-serif text-primary opacity-90 italic font-medium">Tác giả: {storyInfo.author}</p>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <section className="pt-2">
          <button
            onClick={onScrollToChapters}
            className="w-full bg-primary text-on-primary h-14 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform cursor-pointer"
          >
            <BookOpen className="h-5 w-5" />
            Đọc ngay
          </button>
        </section>
      </div>
    </>
  )
}
