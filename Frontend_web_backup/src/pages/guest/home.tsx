import { useState, useEffect } from 'react'
import Hero from "@/components/home/hero"
import TrendingGallery from "@/components/home/trending-gallery"
import Features from "@/components/home/features"
import LatestUpdates from "@/components/home/latest-updates"
import AuthorCTA from "@/components/home/author-cta"
import { HomePageSkeleton } from "@/components/home/home-skeleton"

export default function HomePage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      setIsPageLoaded(true)
    }, 3500)

    return () => clearTimeout(fallbackTimer)
  }, [])

  const handleGalleryReady = () => {
    setIsPageLoaded(true)
  }

  return (
    <div className="relative bg-lumina-surface min-h-screen pb-5">
      {/* SKELETON LAYER */}
      <div
        className={`absolute inset-x-0 top-20 md:top-24 z-50 bg-lumina-surface pointer-events-none select-none transition-opacity duration-1000 ease-out ${isPageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
      >
        <HomePageSkeleton />
      </div>

      {/* REAL CONTENT LAYER */}
      <div
        className={`transition-opacity duration-1000 ease-out ${isPageLoaded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="bg-gradient-to-b from-background via-lumina-dim/50 to-background">
          <Hero />
          <TrendingGallery onReady={handleGalleryReady} />
        </div>

        <Features />
        <LatestUpdates />
        <AuthorCTA />
      </div>
    </div>
  )
}