import SpotlightCard from '@/components/custom/spot-light-card/SpotlightCard'
import { useStoryDetailContext } from '../context/story-detail-context'

export function StorySynopsis() {
  const { storyInfo } = useStoryDetailContext()

  if (!storyInfo) return null

  return (
    <>
      {/* --- DESKTOP VIEWPORT --- */}
      <SpotlightCard
        spotlightColor="rgba(79, 55, 138, 0.18)"
        className="hidden md:block bg-surface-container-low p-6 rounded-lg border border-outline/5 space-y-4"
      >
        <h2 className="text-2xl font-serif font-bold text-foreground">Giới thiệu</h2>
        <div className="space-y-3 text-on-surface-variant leading-relaxed text-sm text-justify">
          {storyInfo.synopsis.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </SpotlightCard>

      {/* --- MOBILE VIEWPORT --- */}
      <section className="md:hidden bg-surface-container-low p-5 rounded-xl border border-outline/5 space-y-3">
        <h3 className="text-xl font-serif font-bold text-foreground">Giới thiệu</h3>
        <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed text-justify">
          {storyInfo.synopsis.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </section>
    </>
  )
}
