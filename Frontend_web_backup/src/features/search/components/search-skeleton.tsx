import Container from '@/components/shared/site/container'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchCardSkeleton() {
  return (
    <div className="flex gap-2 sm:gap-6 p-2 sm:p-4 rounded-md sm:rounded-lg bg-surface-container-low border border-outline/10 select-none w-full overflow-hidden">
      {/* Book Cover Skeleton - Ultra Tiny on Mobile (w-10 h-14), Standard on Desktop (w-28 h-40) */}
      <Skeleton className="w-10 h-14 sm:w-28 sm:h-40 rounded sm:rounded-lg flex-shrink-0 border border-outline/5" />

      {/* Details Skeleton */}
      <div className="flex-grow py-0.5 flex flex-col justify-between overflow-hidden">
        <div className="w-full h-full flex flex-col justify-center">
          
          {/* A. DESKTOP VIEWPORT LAYOUT */}
          <div className="hidden sm:flex justify-between items-start gap-4">
            <div className="flex-grow space-y-3 overflow-hidden">
              {/* Title Bar */}
              <Skeleton className="h-6 w-2/3 rounded" />
              
              {/* Categories Tag Row */}
              <div className="flex gap-1.5 mt-2">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
            
            {/* Chapters & Activity */}
            <div className="flex flex-col items-end shrink-0 gap-2 text-right">
              <Skeleton className="h-6 w-20 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
          </div>

          {/* B. MOBILE VIEWPORT LAYOUT - Ultra-Minimized */}
          <div className="flex sm:hidden flex-col gap-2 w-full justify-center">
            {/* Row 1: Title & Chapter Skeleton */}
            <div className="flex justify-between items-start gap-3 w-full">
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-8 rounded shrink-0" />
            </div>
            
            {/* Row 2: Author Skeleton */}
            <Skeleton className="h-2.5 w-1/3 rounded" />
          </div>

        </div>

        {/* Footer line divider skeleton (Desktop only) */}
        <div className="hidden sm:block mt-6 pt-2 border-t border-outline/5">
          {/* Author line skeleton */}
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </div>
  )
}

export function SearchSkeletonList() {
  return (
    <div className="space-y-4 animate-fade-slide-up">
      {Array.from({ length: 3 }).map((_, idx) => (
        <SearchCardSkeleton key={idx} />
      ))}
    </div>
  )
}

export function FilterGroupSkeleton({ type = 'pills' }: { type?: 'pills' | 'grid-2' | 'grid-3' }) {
  return (
    <div className="space-y-3">
      {/* Title Skeleton */}
      <Skeleton className="h-4 w-24 rounded" />
      
      {/* Options Skeleton */}
      <div className={
        type === 'pills' 
          ? 'flex flex-wrap gap-2' 
          : type === 'grid-2' 
            ? 'grid grid-cols-2 gap-2' 
            : 'grid grid-cols-3 gap-2'
      }>
        {Array.from({ length: type === 'pills' ? 5 : type === 'grid-2' ? 4 : 3 }).map((_, idx) => (
          <Skeleton
            key={idx}
            className={`h-8 rounded-lg ${
              type === 'pills' ? 'w-20 rounded-full' : 'w-full'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function SidebarFiltersSkeleton() {
  return (
    <div className="space-y-8">
      <FilterGroupSkeleton type="pills" />
      <FilterGroupSkeleton type="grid-2" />
      <FilterGroupSkeleton type="grid-3" />
    </div>
  )
}

export function SearchPageSkeleton() {
  return (
    <div className="relative font-sans select-none overflow-hidden pb-12 w-full text-foreground bg-transparent">
      <Container className="relative z-10 pt-4">
        <main className="flex-grow w-full py-6">
          <section className="mb-8 rounded-3xl border border-outline/10 bg-surface-container-low/50 p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
              <div className="space-y-4">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-10 sm:h-14 w-3/4 rounded-xl" />
                <Skeleton className="h-5 w-full max-w-xl rounded-md" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-12 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline/10 pb-4">
              <div className="space-y-3 w-full">
                <Skeleton className="h-8 sm:h-10 w-72 max-w-full rounded-lg" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-5 w-32 rounded" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg sm:hidden" />
            <div className="flex gap-2 sm:hidden">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} className="h-7 w-16 rounded-full shrink-0" />
              ))}
            </div>
          </section>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-grow space-y-4 min-w-0 w-full">
              <SearchSkeletonList />
              <div className="flex items-center justify-center gap-2 pt-2">
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>

            <aside className="hidden lg:block w-[280px] shrink-0 rounded-2xl border border-outline/10 bg-surface-container-low/70 p-5">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded" />
                <Skeleton className="h-5 w-16 rounded" />
              </div>
              <SidebarFiltersSkeleton />
            </aside>
          </div>
        </main>
      </Container>
    </div>
  )
}
