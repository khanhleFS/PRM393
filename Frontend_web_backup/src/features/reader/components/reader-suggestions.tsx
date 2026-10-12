import { useParams, Link } from 'react-router-dom'
import Container from '@/components/shared/site/container'
import { useTopNovels } from '@/hooks/useTopNovels'
import { extractId } from '../services/reader.service'
import type { ReaderSuggestionsProps } from '../types/reader.types'

const PLACEHOLDER = 'https://picsum.photos/seed/novel-cover/400/600'

function truncateTitle(title?: string | null, maxWords = 3): string {
  if (!title) return ''
  const words = title.trim().split(/\s+/)
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...'
  }
  return title
}

export default function ReaderSuggestions({ currentTheme }: ReaderSuggestionsProps) {
  const { novelSlugWithId } = useParams<{ novelSlugWithId: string }>()
  const currentNovelId = novelSlugWithId ? extractId(novelSlugWithId) : ''

  // Fetch top 10 novels to have enough candidates after filtering out current novel
  const { data: allNovels = [], isLoading } = useTopNovels(10)

  // Filter out currently open novel
  const displayList = allNovels.filter(n => {
    if (!novelSlugWithId) return true
    const nId = extractId(n.id)
    const nSlugId = extractId(n.slug)
    if (
      n.slug === novelSlugWithId ||
      String(n.id) === String(currentNovelId) ||
      (nId && nId === currentNovelId) ||
      (nSlugId && nSlugId === currentNovelId)
    ) {
      return false
    }
    return true
  }).slice(0, 4)

  if (isLoading || displayList.length === 0) {
    return null
  }

  return (
    <Container className="mt-16 pb-20 select-none">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-serif text-lg font-bold ${currentTheme.text}`}>
          Gợi ý truyện cùng thể loại
        </h3>
        <Link to="/search" className="text-[10px] font-bold uppercase tracking-wider text-primary hover:underline">
          Xem thêm
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {displayList.map((novel) => (
          <Link
            key={novel.id}
            to={`/${novel.slug}-${novel.id}`}
            className="group block space-y-3 md:space-y-6"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl md:rounded-[32px] bg-secondary/30 border border-black/5 dark:border-white/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-2">
              <img
                src={novel.coverImageUrl || PLACEHOLDER}
                alt={novel.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.onerror = null
                  e.currentTarget.src = PLACEHOLDER
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              {novel.categories && novel.categories.length > 0 && (
                <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {novel.categories[0]}
                </div>
              )}
            </div>

            <div className="space-y-1 text-center">
              <h3 className={`text-base md:text-xl font-bold group-hover:text-primary transition-colors line-clamp-1 ${currentTheme.text}`}>
                {truncateTitle(novel.title, 3)}
              </h3>
              <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold">
                <span className="text-primary inline-block">Chương {novel.chapterCount}</span>
                <span className={`${currentTheme.textMuted} opacity-30 inline-block`}>•</span>
                <span className={`${currentTheme.textMuted} italic inline-block`}>{novel.authorName}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Container>
  )
}
