import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Container from "@/components/shared/site/container"
import SplitText from "@/components/custom/split-text/SplitText"
import { useTopNovels } from "@/hooks/useTopNovels"

const PLACEHOLDER = 'https://picsum.photos/seed/novel-cover/400/600'

function truncateTitle(title?: string | null, maxWords = 3): string {
  if (!title) return ''
  const words = title.trim().split(/\s+/)
  if (words.length > maxWords) {
    return words.slice(0, maxWords).join(' ') + '...'
  }
  return title
}

export default function LatestUpdates() {
  const { data: novels = [], isLoading } = useTopNovels(6)

  return (
    <section className="py-12 md:py-20">
      <Container>
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <div className="space-y-1 md:space-y-2">
            <SplitText
              tag="h2"
              className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-foreground leading-tight md:leading-snug"
              delay={15}
              duration={1}
              splitType="words"
              textAlign="left"
            >
              Cập nhật mới nhất
            </SplitText>
          </div>
          <Link to="/search" className="group flex items-center gap-2 text-xs md:text-sm font-bold text-primary">
            <SplitText
              className="inline"
              delay={20}
              duration={0.8}
              splitType="words"
              textAlign="left"
            >
              Xem tất cả
            </SplitText>
            <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 md:space-y-6 animate-pulse">
                <div className="aspect-[3/4] rounded-xl md:rounded-[32px] bg-surface-container-high" />
                <div className="space-y-2">
                  <div className="h-4 bg-surface-container-high rounded mx-auto w-3/4" />
                  <div className="h-3 bg-surface-container-high rounded mx-auto w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {novels.map((novel) => {
              const slugId = `${novel.slug}-${novel.id}`
              const category = novel.categories?.[0] || ''
              const chapterLabel = novel.chapterCount > 0 ? `Chương ${novel.chapterCount}` : 'Chưa có chương'
              const timeLabel = novel.updatedAt
                ? new Date(novel.updatedAt).toLocaleDateString('vi-VN')
                : 'Vừa xong'

              return (
                <Link key={novel.id} to={`/${slugId}`} className="group block space-y-3 md:space-y-6">
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
                    {category && (
                      <div className="absolute top-4 right-4 bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {category}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-center">
                    <SplitText
                      tag="h3"
                      className="text-base md:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1"
                      delay={10}
                      duration={0.8}
                      splitType="words"
                      textAlign="center"
                    >
                      {truncateTitle(novel.title, 3)}
                    </SplitText>
                    <div className="flex items-center justify-center gap-2 text-[10px] md:text-xs font-bold">
                      <SplitText
                        className="text-primary inline-block"
                        delay={15}
                        duration={0.8}
                        splitType="words"
                        textAlign="center"
                      >
                        {chapterLabel}
                      </SplitText>
                      <SplitText
                        className="text-muted-foreground/30 inline-block"
                        delay={15}
                        duration={0.8}
                        splitType="words"
                        textAlign="center"
                      >
                        •
                      </SplitText>
                      <SplitText
                        className="text-muted-foreground italic inline-block"
                        delay={15}
                        duration={0.8}
                        splitType="words"
                        textAlign="center"
                      >
                        {timeLabel}
                      </SplitText>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Container>
    </section>
  )
}

