export function UserManagementSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-outline-variant bg-surface-container-low p-4 h-24" />
        ))}
      </div>

      {/* Toolbar skeleton */}
      <div className="flex items-center gap-3">
        <div className="h-9 flex-1 rounded-lg bg-surface-container" />
        <div className="h-9 w-28 rounded-lg bg-surface-container" />
        <div className="h-9 w-28 rounded-lg bg-surface-container" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-outline-variant bg-surface-container-low overflow-hidden">
        <div className="h-12 border-b border-outline-variant bg-surface-container" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-outline-variant/40 last:border-0">
            <div className="h-9 w-9 rounded-full bg-surface-container shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-32 rounded bg-surface-container" />
              <div className="h-3 w-48 rounded bg-surface-container" />
            </div>
            <div className="h-5 w-16 rounded-full bg-surface-container" />
            <div className="h-5 w-16 rounded-full bg-surface-container" />
            <div className="h-7 w-24 rounded-lg bg-surface-container" />
          </div>
        ))}
      </div>
    </div>
  )
}
