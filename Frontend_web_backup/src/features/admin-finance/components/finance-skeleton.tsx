import { Skeleton } from '@/components/ui/skeleton'

export function FinanceSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex flex-col justify-between rounded-[1.5rem] border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex min-w-0 gap-4 w-full">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3 rounded" />
                  <Skeleton className="h-4 w-1/2 rounded" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Skeleton className="h-8 w-28 rounded" />
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart & Side deposits */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm h-[320px]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <Skeleton className="h-5 w-48 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
            </div>
            <div className="mt-5 flex-1 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 h-[200px] items-end">
              <div className="space-y-6 h-full flex flex-col justify-between py-2">
                <Skeleton className="h-3 w-12 rounded" />
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-3 w-8 rounded" />
              </div>
              <div className="grid grid-cols-7 gap-3 h-full items-end">
                {Array.from({ length: 7 }).map((_, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end gap-2 h-full">
                    <Skeleton className="w-full rounded-t-md bg-gray-200" style={{ height: `${30 + (idx % 3) * 20}%` }} />
                    <Skeleton className="h-3 w-6 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side deposits */}
        <aside className="lg:col-span-1">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 rounded-md border border-gray-200 bg-white p-3.5 shadow-sm">
                <div className="flex min-w-0 flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-24 rounded" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-3.5 w-10 rounded" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Transaction Table Skeleton */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-3.5 w-64 rounded" />
          </div>
          <Skeleton className="h-8 w-28 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded" />
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-12 w-full rounded" />
          ))}
        </div>
      </section>
    </div>
  )
}
