import { useEffect } from 'react'
import { SlidersHorizontal, Check, X, BookOpen, Crown } from 'lucide-react'
import { useSearchContext } from '../context/search-context'
import type { ReadingStateFilter, SearchMobileFiltersProps } from '../types/search.types'
import { useAuthStore } from '@/store/auth.store'

export function SearchMobileFilters({ isOpen, onClose }: SearchMobileFiltersProps) {
  const {
    isFiltersLoading,
    clearFilters,
    selectedCategory,
    setSelectedCategory,
    selectedChapters,
    setSelectedChapters,
    selectedStatus,
    setSelectedStatus,
    selectedReadingState,
    setSelectedReadingState,
    filterGroups,
  } = useSearchContext()

  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  // LOCK SCROLL: Ngăn cuộn trang nền khi mở ngăn kéo bộ lọc di động
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:hidden">
      {/* Nền mờ phía sau (Blurred Backdrop) */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Bảng điều khiển ngăn kéo (Slide-up Panel Sheet) */}
      <div className="relative w-full bg-surface-container-low border-t border-outline/10 rounded-t-lg p-5 shadow-2xl transition-transform duration-300 max-h-[80vh] overflow-y-auto z-10 animate-fade-slide-up">
        {/* Thanh kéo trang trí ở đỉnh đầu (Drawer Handle) */}
        <div className="w-12 h-1 bg-outline/20 rounded-full mx-auto mb-4" />

        {/* Tiêu đề ngăn kéo */}
        <div className="flex items-center justify-between pb-3 border-b border-outline/10 mb-4">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="size-3.5 text-primary" />
            <h2 className="font-serif text-sm font-bold text-on-surface">Tất cả bộ lọc</h2>
          </div>
          <button
            onClick={clearFilters}
            className="text-[10px] text-primary font-semibold hover:underline cursor-pointer select-none"
          >
            Xóa tất cả
          </button>
        </div>

        {/* Nội dung lọc nâng cao */}
        <div className="space-y-4">
          {isFiltersLoading ? (
            Array.from({ length: 3 }).map((_, gIdx) => (
              <div key={gIdx} className="space-y-2 animate-pulse">
                <div className="h-3.5 w-16 bg-surface-container-highest rounded" />
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="h-6 w-16 bg-surface-container-highest rounded-md" />
                  ))}
                </div>
              </div>
            ))
          ) : (
            filterGroups.map((group) => {
              const selectedValue =
                group.id === 'category'
                  ? selectedCategory
                  : group.id === 'chapters'
                  ? selectedChapters
                  : selectedStatus

              const handleSelectFilter = (value: string) => {
                if (group.id === 'category') setSelectedCategory(value)
                else if (group.id === 'chapters') setSelectedChapters(value)
                else if (group.id === 'status') setSelectedStatus(value)
              }

              return (
                <div key={group.id} className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                    {group.title}
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {group.options.map((opt) => {
                      const isActive = selectedValue === opt.value
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleSelectFilter(opt.value)}
                          className={`py-1 px-2.5 rounded-md font-semibold text-[10px] border transition-all cursor-pointer select-none ${
                            isActive
                              ? 'bg-primary/20 text-primary border-primary/30 font-bold'
                              : 'bg-surface-container border-outline/10 text-on-surface-variant hover:border-primary/25'
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

          {/* Reading State Filter — auth only */}
          {isAuthenticated && (
            <div className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/70">Của tôi</h3>
              <div className="flex flex-wrap gap-1.5">
                {([
                  { label: 'Tất cả', value: 'all' as ReadingStateFilter },
                  { label: 'Đang đọc', value: 'reading' as ReadingStateFilter, icon: <BookOpen className="size-2.5" /> },
                  { label: 'Đã mua', value: 'purchased' as ReadingStateFilter, icon: <Crown className="size-2.5" /> },
                ]).map(opt => {
                  const isActive = selectedReadingState === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedReadingState(opt.value)}
                      className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-md font-semibold text-[10px] border transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-primary/20 text-primary border-primary/30 font-bold'
                          : 'bg-surface-container border-outline/10 text-on-surface-variant hover:border-primary/25'
                      }`}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nút lưu áp dụng (Apply Filter Button) */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-grow py-2.5 bg-primary text-on-primary font-bold rounded-md hover:bg-primary/95 transition-all text-[11px] shadow-md cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <Check className="size-3.5" />
            Áp dụng bộ lọc
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2.5 bg-surface-container border border-outline/10 rounded-md text-on-surface-variant hover:bg-surface-container-high transition-all text-[11px] cursor-pointer flex items-center justify-center"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
