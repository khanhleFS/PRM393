import Container from "@/components/shared/site/container"
import CircularGallery from "@/components/custom/circular-gallery/CircularGallery"
import { useTopNovels } from "@/hooks/useTopNovels"

const PLACEHOLDER = 'https://placehold.co/600x800/4F378A/FFFFFF?text=Novel'

interface TrendingGalleryProps {
  onReady?: () => void
}

export default function TrendingGallery({ onReady }: TrendingGalleryProps) {
  const { data: novels = [], isLoading } = useTopNovels(8)

  const items = novels.length > 0
    ? novels.map((n) => {
        const words = n.title.trim().split(/\s+/)
        const truncated = words.length > 3 ? words.slice(0, 3).join(' ') + '...' : n.title
        return {
          image: n.coverImageUrl || PLACEHOLDER,
          text: truncated,
        }
      })
    : [
        { image: PLACEHOLDER, text: 'Đang tải...' },
        { image: PLACEHOLDER, text: 'Đang tải...' },
        { image: PLACEHOLDER, text: 'Đang tải...' },
        { image: PLACEHOLDER, text: 'Đang tải...' },
        { image: PLACEHOLDER, text: 'Đang tải...' },
        { image: PLACEHOLDER, text: 'Đang tải...' },
      ]

  return (
    <section className="mb-20 md:mb-32 relative z-10 -mt-16 md:-mt-50">
      <div className="h-[400px] sm:h-[600px] md:h-[900px] w-full relative transition-colors">
        <div className="w-full h-full relative overflow-hidden">
          {!isLoading && (
            <CircularGallery
              items={items}
              bend={1}
              textColor="var(--primary)"
              borderRadius={0.05}
              scrollEase={0.1}
              scrollSpeed={1.5}
              font={typeof window !== 'undefined' && window.innerWidth < 768 ? "italic 20px Literata" : "italic 40px Literata"}
              onReady={onReady}
            />
          )}
        </div>
      </div>
      <Container className="mt-12 md:mt-16 text-center">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground">Đa dạng thể loại</p>
      </Container>
    </section>
  )
}

