import { SlidersHorizontal } from 'lucide-react'
import { SearchInput } from '@/components/shared/site/search-input'
import type { SearchHeaderSectionProps } from '../types/search.types'

export function SearchHeaderSection({
  searchQuery,
  isLoading,
  filteredStoriesLength,
  inputValue,
  setInputValue,
  onSubmit,
  setIsMobileFilterOpen,
  activeFiltersCount,
  isFiltersLoading,
  categories,
  selectedCategory,
  setSelectedCategory,
}: SearchHeaderSectionProps) {
  return (
    <section className="mb-6 animate-fade-slide-up flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline/10 pb-4">
        {searchQuery ? (
          <h1 className="font-serif text-[22px] sm:text-4xl font-bold text-on-surface leading-tight">
            Kết quả tìm kiếm cho <span className="text-primary italic break-all">"{searchQuery}"</span>
          </h1>
        ) : (
          <h1 className="font-serif text-[22px] sm:text-4xl font-bold text-on-surface leading-tight">
            Khám phá các tác phẩm
          </h1>
        )}
        <span className="text-sm sm:text-base font-medium text-on-surface-variant/80 whitespace-nowrap mb-1">
          {isLoading ? 'Đang tìm kiếm...' : `Tìm thấy ${filteredStoriesLength} truyện`}
        </span>
      </div>

      {/* Interactive Search Input Box - Visible on Mobile only, Hidden on Desktop */}
      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={onSubmit}
        placeholder="Tìm kiếm truyện, tác giả..."
        className="mt-4 block sm:hidden"
        inputClassName="bg-surface-container-low border-outline/20 rounded-lg py-3 shadow-sm text-xs font-sans"
      />

      {/* Mobile Category Horizontal Scrollable Capsule Filter Strip */}
      <div className="block sm:hidden mt-3.5 overflow-x-auto whitespace-nowrap pb-1.5 -mx-4 px-4 select-none scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex gap-1.5 items-center">
          {/* ⚙️ Nút Mở Bottom Sheet Lọc Nâng Cao */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              activeFiltersCount > 0
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container-high border-outline/10 text-on-surface-variant hover:border-primary/20'
            }`}
          >
            <SlidersHorizontal className="size-3" />
            Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </button>

          <div className="h-4 w-px bg-outline/10 shrink-0" />

          {/* Danh mục lọc nhanh */}
          {isFiltersLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-7 w-16 bg-surface-container-highest rounded-full shrink-0 animate-pulse"
              />
            ))
          ) : (
            categories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-primary/20 text-primary border-primary/30 shadow-sm'
                    : 'bg-surface-container border-outline/10 text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
