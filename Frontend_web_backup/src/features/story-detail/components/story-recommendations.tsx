import { Link } from 'react-router-dom'
import { Eye, Loader2, BookOpen } from 'lucide-react'
import { useStoryDetailContext } from '../context/story-detail-context'
import { useTopNovels } from '@/hooks/useTopNovels'

const COVER_PLACEHOLDER = 'https://picsum.photos/seed/novel-cover/400/600'

function truncateTitle(title?: string | null, maxWords = 3): string {
  if (!title) return ''
  const words = title.trim().split(/\s+/)
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...'
  }
  return title
}

export function StoryRecommendations() {
  const { storyInfo } = useStoryDetailContext()
  const { data: topNovels = [], isLoading } = useTopNovels(10)

  if (!storyInfo) return null

  // Recommend other stories (excluding current story)
  const recommendations = topNovels.filter((s) => {
    if (String(s.id) === String(storyInfo.id)) return false
    if (s.slug && storyInfo.slug && s.slug === storyInfo.slug) return false
    return true
  })
  const displayList = recommendations.slice(0, 4)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-primary w-6 h-6" />
      </div>
    )
  }

  if (displayList.length === 0) return null

  return (
    <>
      {/* --- DESKTOP VIEWPORT --- */}
      <section className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-foreground">Truyện đề cử</h3>
          <Link to="/search" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">Xem thêm</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {displayList.map((rec) => (
            <Link key={rec.id} to={`/${rec.slug}-${rec.id}`} className="group block space-y-3">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-secondary/30 border border-black/5 dark:border-white/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1">
                <img
                  src={rec.coverImageUrl || COVER_PLACEHOLDER}
                  alt={rec.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = COVER_PLACEHOLDER
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-3 right-3 bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {rec.categories?.[0] || 'Khác'}
                </div>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{truncateTitle(rec.title, 3)}</h3>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-1 text-primary">
                    <span>Chương {rec.chapterCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground italic">
                    <span>{rec.authorName}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- MOBILE VIEWPORT --- */}
      <section className="md:hidden space-y-5 pb-8 border-t border-outline/10 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-foreground">Có thể bạn sẽ thích</h3>
          <Link to="/search" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">Xem thêm</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {displayList.map((rec) => (
            <Link key={rec.id} to={`/${rec.slug}-${rec.id}`} className="group block space-y-3">
              {/* Đã thay đổi rounded-2xl thành rounded-md ở dòng dưới */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-secondary/30 border border-black/5 dark:border-white/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1">
                <img
                  src={rec.coverImageUrl || COVER_PLACEHOLDER}
                  alt={rec.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.onerror = null
                    e.currentTarget.src = COVER_PLACEHOLDER
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-3 right-3 bg-primary text-on-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {rec.categories?.[0] || 'Khác'}
                </div>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{truncateTitle(rec.title, 3)}</h3>
                <div className="flex items-center justify-center gap-3 text-[10px] font-bold">
                  <div className="flex items-center gap-1 text-primary">
                    <Eye className="h-3 w-3" />
                    <span>{rec.viewCount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 text-foreground">
                    <BookOpen className="h-3 w-3" />
                    <span>{rec.chapterCount || 0} ch</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}