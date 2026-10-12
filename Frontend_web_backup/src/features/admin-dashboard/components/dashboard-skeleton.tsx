import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Chart and Stats Important Column */}
      <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-9 sm:p-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <Skeleton className="h-4 w-24 rounded" />
          </div>
          <div className="mt-4 flex h-28 items-end gap-2 sm:h-24">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-2 h-full">
                <Skeleton className="w-full rounded-t-md bg-gray-200" style={{ height: `${20 + (idx % 4) * 15}%` }} />
                <Skeleton className="h-3 w-4 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-[6rem] flex-col items-start justify-center rounded-xl bg-gray-100 p-5 shadow-sm lg:col-span-3">
          <Skeleton className="h-4 w-32 rounded bg-gray-300" />
          <Skeleton className="mt-4 h-10 w-24 rounded bg-gray-300" />
        </div>
      </section>

      {/* Grid: User stats + Recent Transactions */}
      <section className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12">
        {/* User stats */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-5 sm:p-5">
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <Skeleton className="h-4 w-32 rounded" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50/50 p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-6 w-10 rounded" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3 border-t border-gray-100 pt-3.5">
            <Skeleton className="h-3 w-28 rounded" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-7 sm:p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <Skeleton className="h-4 w-36 rounded" />
              <Skeleton className="h-7 w-20 rounded" />
            </div>

            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Package Management */}
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-8 w-28 rounded" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex flex-col justify-between rounded-md border border-gray-200 p-4">
              <div className="space-y-2">
                <Skeleton className="mx-auto h-4 w-20 rounded" />
                <Skeleton className="mx-auto h-8 w-16 rounded" />
              </div>
              <Skeleton className="mt-5 h-14 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
