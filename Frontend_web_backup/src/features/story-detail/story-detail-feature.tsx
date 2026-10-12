import { StoryBanner } from './components/story-banner'
import { StorySynopsis } from './components/story-synopsis'
import { StoryChapters } from './components/story-chapters'
import { StoryRecommendations } from './components/story-recommendations'
import Container from '@/components/shared/site/container'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

// Import Context & Skeletons
import { StoryDetailProvider, useStoryDetailContext } from './context/story-detail-context'
import { StoryDetailPageSkeleton } from './components/story-detail-skeleton'

function StoryDetailContent() {
  const navigate = useNavigate()
  const {
    storyInfo,
    chapters,
    isLoading,
    inLibrary,
    toggleLibrary,
    isSortedAsc,
    toggleSort,
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedChapters
  } = useStoryDetailContext()

  const scrollToChapters = () => {
    const desktopEl = document.getElementById('chapters-section-desktop')
    const mobileEl = document.getElementById('chapters-section-mobile')

    // Check if desktop element is visible
    if (desktopEl && getComputedStyle(desktopEl).display !== 'none') {
      desktopEl.scrollIntoView({ behavior: 'smooth' })
    } else if (mobileEl) {
      mobileEl.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading || !storyInfo) {
    return <StoryDetailPageSkeleton />
  }

  return (
    <div className="relative select-none w-full text-foreground bg-transparent">
      <Container className="pt-6 space-y-2 md:space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline/10 hover:border-primary/20 text-xs font-bold bg-surface-container-high/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer shadow-sm w-fit group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Quay lại</span>
        </button>

        <StoryBanner
          inLibrary={inLibrary}
          onLibraryToggle={toggleLibrary}
          onScrollToChapters={scrollToChapters}
        />

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <StorySynopsis />
            <StoryChapters
              storySlug={storyInfo.slug}
              chaptersLength={chapters.length}
              paginatedChapters={paginatedChapters}
              currentPage={currentPage}
              totalPages={totalPages}
              isSortedAsc={isSortedAsc}
              onSortToggle={toggleSort}
              onPageChange={setCurrentPage}
            />
          </div>

          <aside className="space-y-8">
            <StoryRecommendations />
          </aside>
        </div>

        <div className="pt-6 border-t border-outline/10 flex justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline/10 hover:border-primary/20 text-xs font-bold bg-surface-container-high/40 hover:bg-primary/5 hover:text-primary transition-all duration-200 cursor-pointer shadow-sm w-fit group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Quay lại</span>
          </button>
        </div>
      </Container>
    </div>
  )
}

export default function StoryDetailFeature() {
  const { novelSlugWithId } = useParams<{ novelSlugWithId: string }>()
  return (
    <StoryDetailProvider storyId={novelSlugWithId || ''}>
      <StoryDetailContent />
    </StoryDetailProvider>
  )
}
