import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Container from '@/components/shared/site/container'

// Import Context & Components
import { SearchProvider, useSearchContext } from './context/search-context'
import {
  ParticleBackdrop,
  SearchSidebar,
  SearchPagination,
  SearchPageSkeleton,
  SearchBanner,
  SearchHeaderSection,
  SearchResultsSection,
  SearchMobileFilters,
} from './components'

function SearchContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('q') || ''

  // Local search input box state to avoid keypress lag
  const [inputValue, setInputValue] = useState(searchQuery)

  // State to control mobile Bottom Sheet Filter Drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const {
    filteredStories,
    isLoading,
    isFiltersLoading,
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedChapters,
    selectedStatus,
  } = useSearchContext()

  // Keep local input field synchronized when URL search params are updated or reset!
  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  // Count active filters to display as a badge on the mobile Filter Button
  const activeFiltersCount =
    (selectedCategory !== 'Tất cả' ? 1 : 0) +
    (selectedChapters !== 'Any' ? 1 : 0) +
    (selectedStatus !== 'All' ? 1 : 0)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams(inputValue.trim() ? { q: inputValue.trim() } : {})
  }

  if (isLoading && isFiltersLoading && filteredStories.length === 0) {
    return (
      <>
        <ParticleBackdrop />
        <SearchPageSkeleton />
      </>
    )
  }

  return (
    <div className="relative font-sans select-none overflow-hidden pb-12 w-full text-foreground bg-transparent">
      {/* Floating Particles Backdrop */}
      <ParticleBackdrop />

      <Container className="relative z-10 pt-4">
        <main className="flex-grow w-full py-6">
          <SearchBanner />

          {/* 1. Dynamic Header with interactive Search Input Box */}
          <SearchHeaderSection
            searchQuery={searchQuery}
            isLoading={isLoading}
            filteredStoriesLength={filteredStories.length}
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSubmit={handleSearchSubmit}
            setIsMobileFilterOpen={setIsMobileFilterOpen}
            activeFiltersCount={activeFiltersCount}
            isFiltersLoading={isFiltersLoading}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* 2. Main Column: Story List Results or Loading Skeleton */}
            <div className="flex-grow space-y-4 min-w-0 w-full">
              <SearchResultsSection />

              {/* 3. Bottom Pagination */}
              <SearchPagination />
            </div>

            {/* Sidebar Column: Filters Sticky Panel - CHỈ HIỂN THỊ TRÊN DESKTOP */}
            <div className="hidden lg:block">
              <SearchSidebar />
            </div>
          </div>
        </main>
      </Container>

      {/* C. MOBILE FILTER DRAWER BOTTOM SHEET - Trượt lên cực kỳ thời thượng */}
      <SearchMobileFilters
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />
    </div>
  )
}

export default function SearchFeature() {
  return (
    <SearchProvider>
      <SearchContent />
    </SearchProvider>
  )
}
