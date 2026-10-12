export function ReaderSkeleton() {
  return (
    <div className="w-full max-w-[780px] mx-auto px-4 py-6 sm:p-10 animate-pulse space-y-8">
      {/* Breadcrumb Skeleton */}
      <div className="flex gap-2 justify-center sm:justify-start">
        <div className="h-3 w-16 bg-surface-container-highest rounded" />
        <div className="h-3 w-4 bg-surface-container-highest rounded" />
        <div className="h-3 w-20 bg-surface-container-highest rounded" />
        <div className="h-3 w-4 bg-surface-container-highest rounded" />
        <div className="h-3 w-16 bg-surface-container-highest rounded" />
      </div>

      {/* Header Skeleton */}
      <div className="flex flex-col items-center space-y-4 my-8">
        <div className="h-4 w-24 bg-surface-container-highest rounded" />
        <div className="h-10 w-3/4 sm:w-1/2 bg-surface-container-highest rounded-lg" />
        <div className="h-4 w-48 bg-surface-container-highest rounded" />
      </div>

      <div className="h-[1px] w-full bg-outline/10 my-6" />

      {/* Navigation Skeleton (Top) */}
      <div className="flex justify-between items-center my-6">
        <div className="h-10 w-32 bg-surface-container-highest rounded-lg" />
        <div className="h-10 w-10 bg-surface-container-highest rounded-lg" />
        <div className="h-10 w-32 bg-surface-container-highest rounded-lg" />
      </div>

      <div className="h-[1px] w-full bg-outline/10 my-6" />

      {/* Content Skeleton */}
      <div className="space-y-6 my-8">
        <div className="h-4 w-full bg-surface-container-highest rounded" />
        <div className="h-4 w-full bg-surface-container-highest rounded" />
        <div className="h-4 w-[90%] bg-surface-container-highest rounded" />
        <div className="h-4 w-full bg-surface-container-highest rounded" />
        <div className="h-4 w-[80%] bg-surface-container-highest rounded" />
      </div>
      
      <div className="space-y-6 my-8">
        <div className="h-4 w-full bg-surface-container-highest rounded" />
        <div className="h-4 w-[95%] bg-surface-container-highest rounded" />
        <div className="h-4 w-full bg-surface-container-highest rounded" />
      </div>
    </div>
  )
}
