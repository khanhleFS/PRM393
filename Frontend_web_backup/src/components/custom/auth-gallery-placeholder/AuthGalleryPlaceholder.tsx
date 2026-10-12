import { useState, useEffect } from 'react'
import { useTopNovels } from '@/hooks/useTopNovels'

const FALLBACK_GRADIENT_TINTS = [
  { accent: 'from-cyan-300 to-sky-500', tint: 'from-cyan-400/90 via-sky-500/90 to-indigo-600/90' },
  { accent: 'from-fuchsia-300 to-pink-500', tint: 'from-fuchsia-400/90 via-pink-500/90 to-rose-600/90' },
  { accent: 'from-violet-300 to-purple-500', tint: 'from-violet-400/90 via-purple-500/90 to-indigo-700/90' },
  { accent: 'from-amber-200 to-orange-400', tint: 'from-amber-300/90 via-orange-400/90 to-rose-500/90' },
]

type GalleryCard = {
  title: string
  coverUrl: string | null
  accent: string
  tint: string
}

function GalleryCardView({ card }: { card: GalleryCard }) {
  return (
    <div className="group relative h-[250px] w-[200px] overflow-hidden rounded-lg border border-primary bg-primary shadow-lg transition-all duration-300 ease-out">
      {card.coverUrl ? (
        <>
          <img
            src={card.coverUrl}
            alt={card.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-primary from-30% to-primary/0" />
        </>
      ) : (
        <>
          <div className={`absolute inset-0 bg-gradient-to-br ${card.tint} opacity-90`} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent mix-blend-overlay" />
          {/* Lớp phủ primary đồng bộ cho trạng thái không có ảnh */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent opacity-90" />
        </>
      )}

      {/* Tiêu đề (Title) */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-4">
        {/* Lưu ý: Nếu màu primary của bạn quá sáng, hãy đổi 'text-white' thành 'text-primary-foreground' hoặc màu tối để dễ đọc */}
        <p className="text-sm font-medium leading-tight text-primary drop-shadow-md line-clamp-2">
          {card.title}
        </p>
      </div>
    </div>
  )
}

function ScrollingRow({ cards, reverse = false, animate = true }: { cards: GalleryCard[]; reverse?: boolean; animate?: boolean }) {
  const track = [...cards, ...cards]

  return (
    <div className="scroller-container w-full max-w-full overflow-hidden [transform-style:preserve-3d]">
      <div className={`scroller-track flex w-max gap-5 [transform-style:preserve-3d] ${animate ? (reverse ? 'scroll-right' : 'scroll-left') : ''}`}>
        {track.map((card, index) => (
          <GalleryCardView key={`${card.title}-${index}`} card={card} />
        ))}
      </div>
    </div>
  )
}

function buildRows(novels: { title: string; coverImageUrl: string | null }[]): [GalleryCard[], GalleryCard[], GalleryCard[]] {
  const makeFallback = (): GalleryCard[] =>
    FALLBACK_GRADIENT_TINTS.map((g) => ({ title: 'Đang tải...', coverUrl: null, ...g }))

  if (novels.length === 0) return [makeFallback(), makeFallback(), makeFallback()]

  const makeRow = (offset: number): GalleryCard[] =>
    novels.map((novel, i) => ({
      title: novel.title,
      coverUrl: novel.coverImageUrl,
      ...FALLBACK_GRADIENT_TINTS[(offset + i) % FALLBACK_GRADIENT_TINTS.length],
    }))

  return [makeRow(0), makeRow(1), makeRow(2)]
}

export default function AuthGalleryPlaceholder() {
  const [animReady, setAnimReady] = useState(false)
  const { data: novels } = useTopNovels(4)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setAnimReady(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const [rowOne, rowTwo, rowThree] = buildRows(novels)

  return (
    <div className="relative h-full w-full overflow-hidden bg-[radial-gradient(circle_at_center,var(--surface-container)_0%,var(--background)_100%)] text-foreground [perspective:1500px]">
      <style>{`
        @keyframes scroll-left-anim {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 0.625rem)); }
        }
        @keyframes scroll-right-anim {
          0% { transform: translateX(calc(-50% - 0.625rem)); }
          100% { transform: translateX(0); }
        }
        .scroll-left { animation: scroll-left-anim 35s linear infinite; }
        .scroll-right { animation: scroll-right-anim 35s linear infinite; }
        @media (max-width: 1024px) {
          .carousel-shell { transform: scale(0.8) rotateX(60deg) rotateY(0deg) rotateZ(45deg); }
        }
        @media (max-width: 768px) {
          .carousel-shell { transform: scale(0.6) rotateX(60deg) rotateY(0deg) rotateZ(45deg); }
        }
      `}</style>

      <div className="absolute bottom-0 left-[-22rem] flex origin-bottom-left translate-x-0 translate-y-40 scale-[1.05] flex-col gap-5 pb-6 pl-6 lg:left-[-34rem] lg:translate-y-64 lg:scale-[0.98] lg:pb-8 lg:pl-8">
        <div className="carousel-shell flex flex-col gap-5 [transform:rotateX(60deg)_rotateY(0deg)_rotateZ(45deg)] [transform-style:preserve-3d] transition-transform duration-500 ease-out">
          <ScrollingRow cards={rowOne} animate={animReady} />
          <div className="scroller-container ml-[-64px] w-full max-w-full overflow-hidden [transform-style:preserve-3d]">
            <div className={`scroller-track flex w-max gap-5 [transform-style:preserve-3d] ${animReady ? 'scroll-right' : ''}`}>
              {[...rowTwo, ...rowTwo].map((card, index) => (
                <GalleryCardView key={`${card.title}-rev-${index}`} card={card} />
              ))}
            </div>
          </div>
          <ScrollingRow cards={rowThree} animate={animReady} />
        </div>
      </div>
    </div>
  )
}