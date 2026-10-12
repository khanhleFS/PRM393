import Container from '@/components/shared/site/container'

export function StoryDetailBannerSkeleton() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 md:gap-10 animate-pulse">
      {/* Cover Skeleton */}
      <div className="w-48 h-72 sm:w-64 sm:h-96 shrink-0 rounded-xl bg-surface-container-highest shadow-xl overflow-hidden mx-auto md:mx-0 relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-highest/20 to-surface-container-highest/60" />
      </div>
      
      {/* Info Skeleton */}
      <div className="flex-1 space-y-6 pt-2 text-center md:text-left">
        <div className="h-10 w-3/4 mx-auto md:mx-0 bg-surface-container-highest rounded-lg" />
        <div className="h-5 w-1/2 mx-auto md:mx-0 bg-surface-container-highest rounded" />
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
          <div className="h-6 w-20 bg-surface-container-highest rounded-full" />
          <div className="h-6 w-24 bg-surface-container-highest rounded-full" />
          <div className="h-6 w-16 bg-surface-container-highest rounded-full" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-outline/10">
          <div className="space-y-2">
            <div className="h-4 w-12 mx-auto md:mx-0 bg-surface-container-highest rounded" />
            <div className="h-6 w-16 mx-auto md:mx-0 bg-surface-container-highest rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 mx-auto md:mx-0 bg-surface-container-highest rounded" />
            <div className="h-6 w-16 mx-auto md:mx-0 bg-surface-container-highest rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 mx-auto md:mx-0 bg-surface-container-highest rounded" />
            <div className="h-6 w-16 mx-auto md:mx-0 bg-surface-container-highest rounded" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
          <div className="h-12 w-32 sm:w-40 bg-surface-container-highest rounded-xl" />
          <div className="h-12 w-32 sm:w-40 bg-surface-container-highest rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function StoryChaptersSkeleton() {
  return (
    <div className="space-y-4 animate-pulse mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="h-6 w-32 bg-surface-container-highest rounded" />
        <div className="h-8 w-24 bg-surface-container-highest rounded-lg" />
      </div>
      
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="h-16 w-full bg-surface-container-highest rounded-xl" />
      ))}
    </div>
  )
}

export function StoryDetailPageSkeleton() {
  return (
    <div className="relative select-none pb-12 w-full text-foreground bg-transparent">
      <Container className="pt-6 md:pt-12 space-y-8 md:space-y-12 animate-pulse">
        <StoryDetailBannerSkeleton />
        
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Synopsis Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-surface-container-highest rounded" />
              <div className="h-4 w-full bg-surface-container-highest rounded" />
              <div className="h-4 w-full bg-surface-container-highest rounded" />
              <div className="h-4 w-3/4 bg-surface-container-highest rounded" />
            </div>
            <StoryChaptersSkeleton />
          </div>
          
          <aside className="space-y-8">
            {/* Recommendations Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-32 bg-surface-container-highest rounded" />
              <div className="h-24 w-full bg-surface-container-highest rounded-xl" />
              <div className="h-24 w-full bg-surface-container-highest rounded-xl" />
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

