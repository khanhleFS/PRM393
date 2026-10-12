import Container from '@/components/shared/site/container'
import { surfaceCardClass } from './profile-styles'

export function ProfileHeaderSkeleton() {
  return (
    <section className="mb-8 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className="h-14 w-14 shrink-0 rounded-full bg-surface-container-high animate-pulse lg:h-16 lg:w-16"></div>
        <div className="h-8 w-48 rounded bg-surface-container-high animate-pulse lg:h-10"></div>
      </div>
      <div className="h-12 w-12 rounded-lg bg-surface-container animate-pulse"></div>
    </section>
  )
}

export function WalletCardSkeleton() {
  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-container-high animate-pulse"></div>
          <div className="h-5 w-24 rounded bg-surface-container-high animate-pulse"></div>
        </div>
        <div className="flex flex-col gap-6 p-5 sm:p-6">
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-surface-container-high animate-pulse"></div>
            <div className="h-10 w-40 rounded bg-surface-container-high animate-pulse"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 rounded bg-surface-container-high animate-pulse"></div>
            <div className="h-10 rounded bg-surface-container-high animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function TransactionSectionSkeleton() {
  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-container-high animate-pulse"></div>
          <div className="h-5 w-32 rounded bg-surface-container-high animate-pulse"></div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex w-full items-center gap-3 border-b border-outline/5 p-4 last:border-b-0">
            <div className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded bg-surface-container-high animate-pulse"></div>
                <div className="h-4 w-16 rounded bg-surface-container-high animate-pulse"></div>
              </div>
              <div className="h-3 w-48 rounded bg-surface-container-high animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function PersonalInfoSectionSkeleton() {
  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-container-high animate-pulse"></div>
          <div className="h-5 w-36 rounded bg-surface-container-high animate-pulse"></div>
        </div>
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_1fr_1.5fr] lg:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 shrink-0 rounded-full bg-surface-container-high animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-20 rounded bg-surface-container-high animate-pulse"></div>
                <div className="h-4 w-32 rounded bg-surface-container-high animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function CollectionSectionSkeleton() {
  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4 flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-surface-container-high animate-pulse"></div>
          <div className="h-5 w-32 rounded bg-surface-container-high animate-pulse"></div>
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-outline/5 bg-surface p-4">
              <div className="flex items-center gap-4">
                <div className="h-5 w-5 rounded-full bg-surface-container-high animate-pulse"></div>
                <div className="h-4 w-28 rounded bg-surface-container-high animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProfilePageSkeleton() {
  return (
    <Container className="pb-12 pt-10 text-foreground">
      <div className="mx-auto max-w-md sm:max-w-lg lg:max-w-none">
        <ProfileHeaderSkeleton />

        <div className="grid gap-8 lg:grid-cols-[minmax(340px,420px)_1fr] lg:items-start">
          <div className="space-y-8">
            <WalletCardSkeleton />
            <TransactionSectionSkeleton />
          </div>

          <div className="space-y-8">
            <PersonalInfoSectionSkeleton />
            <CollectionSectionSkeleton />
          </div>
        </div>
      </div>
    </Container>
  )
}
