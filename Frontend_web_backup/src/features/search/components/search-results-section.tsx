import { useMemo } from 'react'
import { Search, RotateCcw } from 'lucide-react'
import { useSearchContext } from '../context/search-context'
import { SearchCard } from './search-card'
import { SearchSkeletonList } from './search-skeleton'

export function SearchResultsSection() {
  const { filteredStories, pagedStories, isLoading, clearFilters, userReadState } = useSearchContext()

  // Split pagedStories into "Đang đọc & Đã mua" vs "Khám phá thêm"
  const { readingOrUnlocked, exploreMore } = useMemo(() => {
    const readingOrUnlocked: typeof pagedStories = []
    const exploreMore: typeof pagedStories = []

    pagedStories.forEach((story) => {
      const isBookmarked = !!userReadState?.bookmarks[story.id]
      const hasUnlocked = (userReadState?.unlockedChapters[story.id] ?? []).length > 0
      if (isBookmarked || hasUnlocked) {
        readingOrUnlocked.push(story)
      } else {
        exploreMore.push(story)
      }
    })

    return { readingOrUnlocked, exploreMore }
  }, [pagedStories, userReadState])

  if (isLoading) {
    return <SearchSkeletonList />
  }

  if (filteredStories.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-surface-container-low/50 border border-outline/10 rounded-md animate-fade-slide-up">
        <Search className="size-16 text-outline/30 mx-auto animate-pulse" />
        <p className="text-on-surface-variant font-semibold text-xs">
          Không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại.
        </p>
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-primary text-on-primary rounded-md text-xs font-semibold hover:bg-primary/95 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <RotateCcw className="size-4" />
          Đặt lại bộ lọc
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {readingOrUnlocked.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-outline/10 pb-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="font-serif text-lg font-bold text-on-surface">Đang đọc &amp; Đã mua</h3>
            <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
              {readingOrUnlocked.length}
            </span>
          </div>
          <div className="space-y-4">
            {readingOrUnlocked.map((story) => (
              <SearchCard key={story.id} story={story} userReadState={userReadState} />
            ))}
          </div>
        </div>
      )}

      {exploreMore.length > 0 && (
        <div className="space-y-4">
          {readingOrUnlocked.length > 0 && (
            <div className="flex items-center gap-2 border-b border-outline/10 pb-2 pt-4">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <h3 className="font-serif text-lg font-bold text-on-surface">Khám phá thêm</h3>
              <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                {filteredStories.length}
              </span>
            </div>
          )}
          <div className="space-y-4">
            {exploreMore.map((story) => (
              <SearchCard key={story.id} story={story} userReadState={userReadState} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

