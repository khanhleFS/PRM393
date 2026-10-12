import { useSearchContext } from '../context/search-context'
import type { ReadingStateFilter } from '../types/search.types'
import { SlidersHorizontal, RotateCcw, BookOpen, Crown } from 'lucide-react'
import SpotlightCard from '@/components/custom/spot-light-card/SpotlightCard'
import { SidebarFiltersSkeleton } from './search-skeleton'
import { useAuthStore } from '@/store/auth.store'

export function SearchSidebar() {
  const {
    filterGroups,
    isFiltersLoading,
    selectedCategory,
    setSelectedCategory,
    selectedChapters,
    setSelectedChapters,
    selectedStatus,
    setSelectedStatus,
    selectedReadingState,
    setSelectedReadingState,
    clearFilters
  } = useSearchContext()

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const handleSelectFilter = (groupId: string, value: string) => {
    if (groupId === 'category') setSelectedCategory(value)
    else if (groupId === 'chapters') setSelectedChapters(value)
    else if (groupId === 'status') setSelectedStatus(value)
  }

  const getSelectedValue = (groupId: string) => {
    if (groupId === 'category') return selectedCategory
    if (groupId === 'chapters') return selectedChapters
    if (groupId === 'status') return selectedStatus
    return ''
  }

  const readingStateOptions: { label: string; value: ReadingStateFilter; icon?: React.ReactNode }[] = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang đọc', value: 'reading', icon: <BookOpen className="size-3" /> },
    { label: 'Đã mua', value: 'purchased', icon: <Crown className="size-3" /> },
  ]

  return (
    <aside className="w-full lg:w-80 flex-shrink-0">
      <SpotlightCard
        spotlightColor="rgba(79, 55, 138, 0.15)"
        className="space-y-8 bg-surface-container-low/50 border border-outline/10 rounded-lg p-6 backdrop-blur-md"
      >

        {/* Sidebar Header */}
        <div className="flex items-center justify-between pb-4 border-b border-outline/10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-on-surface" />
            <h2 className="font-serif text-xl font-bold text-on-surface">Bộ lọc</h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-xs text-primary font-semibold hover:underline cursor-pointer select-none bg-transparent border-0 p-0 flex items-center gap-1"
          >
            <RotateCcw className="size-3" />
            Xóa tất cả
          </button>
        </div>

        {/* Dynamic Filter Groups or loading skeleton */}
        {isFiltersLoading ? (
          <SidebarFiltersSkeleton />
        ) : (
          filterGroups.map((group) => {
            const selectedValue = getSelectedValue(group.id)

            return (
              <div
                key={group.id}
                className={`space-y-3 ${group.id === 'category' ? 'hidden lg:block' : ''}`}
              >
                <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">
                  {group.title}
                </h3>

                <div className={
                  group.type === 'pills'
                    ? 'flex flex-wrap gap-2'
                    : group.type === 'grid-2'
                      ? 'grid grid-cols-2 gap-2'
                      : 'grid grid-cols-3 gap-2'
                }>
                  {group.options.map((opt) => {
                    const isActive = selectedValue === opt.value

                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelectFilter(group.id, opt.value)}
                        className={`px-3 py-2 rounded-lg font-semibold text-xs border transition-all text-center cursor-pointer select-none ${group.type === 'pills' ? 'rounded-full py-1.5' : ''
                          } ${isActive
                            ? 'bg-primary/20 text-primary border-primary/30 font-semibold'
                            : 'bg-surface-container border-outline/10 text-on-surface-variant hover:border-primary/30'
                          }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}

        {/* Reading State Filter — only shown when authenticated */}
        {isAuthenticated && (
          <div className="space-y-3 pt-4 border-t border-outline/10">
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-on-surface-variant/70">
              Của tôi
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {readingStateOptions.map(opt => {
                const isActive = selectedReadingState === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedReadingState(opt.value)}
                    className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg font-semibold text-xs border transition-all cursor-pointer select-none ${isActive
                        ? 'bg-primary/20 text-primary border-primary/30'
                        : 'bg-surface-container border-outline/10 text-on-surface-variant hover:border-primary/30'
                      }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

      </SpotlightCard>
    </aside>
  )
}
