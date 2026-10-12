import { useNavigate } from 'react-router-dom'
import { Bookmark, CheckCircle2, History, List, WalletCards } from 'lucide-react'
import { SectionTitle } from './section-title'
import { surfaceCardClass } from './profile-styles'
import { useProfile } from '../context/profile.context'
import type { CollectionItem, CollectionStory, CollectionStoryItemProps } from '../types/profile.types'
import type { LucideIcon } from 'lucide-react'

const COLLECTION_ICONS: Record<string, LucideIcon> = {
  bookmarks: Bookmark,
  'reading-list': List,
  history: History
}

export function CollectionSection() {
  const { data } = useProfile()
  const collections = data?.collections ?? []
  const navigate = useNavigate()

  return (
    <section>
      <div className={`overflow-hidden rounded-lg ${surfaceCardClass}`}>
        <div className="border-b border-outline/5 px-5 py-4">
          <SectionTitle icon={WalletCards}>Bộ sưu tập</SectionTitle>
        </div>
        <div className="space-y-3 p-5 sm:p-6">
          {collections.map((collection: CollectionItem, index: number) => {
            const Icon = COLLECTION_ICONS[collection.key] ?? Bookmark

            return (
              <div
                key={collection.key}
                className="collapse collapse-arrow rounded-lg border border-outline/5 bg-surface"
              >
                <input type="checkbox" defaultChecked={index === 0} />
                <div className="collapse-title group flex items-center gap-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container">
                  <Icon className="h-5 w-5 text-primary/70 transition-colors group-hover:text-primary" />
                  {collection.label}
                </div>

                <div className="collapse-content">
                  <div className="space-y-2">
                    {collection.stories.length > 0 ? (
                      collection.stories.map((story: CollectionStory) => (
                        <CollectionStoryItem
                          key={story.id}
                          story={story}
                          onClick={() => navigate(story.path)}
                        />
                      ))
                    ) : (
                      <p className="py-2 text-center text-xs text-on-surface-variant/60">
                        Chưa có truyện nào trong danh mục này.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CollectionStoryItem({
  story,
  onClick
}: CollectionStoryItemProps) {
  const isCompleted = story.progress >= 100

  return (
    <button
      onClick={onClick}
      className="group flex w-full gap-4 rounded-md bg-surface-container p-3 text-left transition-colors hover:bg-surface-container-high"
    >
      <span className="h-[72px] w-12 shrink-0 overflow-hidden rounded-sm shadow-sm">
        <img
          alt={story.title}
          className="h-full w-full object-cover"
          src={story.coverUrl}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = 'https://picsum.photos/seed/novel-cover/400/600'
          }}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="truncate text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
          {story.title}
        </span>
        <span className="mt-1.5 truncate text-[11px] font-semibold text-on-surface-variant">
          {story.meta}
        </span>
        {!story.hideProgress && (
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-outline/15">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(3, Math.min(100, story.progress))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-primary shrink-0 bg-primary/10 px-1.5 py-0.5 rounded-md">
              {Math.round(story.progress)}%
            </span>
          </div>
        )}
      </span>
      {isCompleted && !story.hideProgress && (
        <CheckCircle2 className="self-center h-6 w-6 shrink-0 fill-primary text-on-primary" />
      )}
    </button>
  )
}
