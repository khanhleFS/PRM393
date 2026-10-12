import { useParams } from 'react-router-dom'
import { ChapterForm } from './components/chapter-form'
import { useChapterDetails, useChapters } from './hooks/use-author-novels'

export default function AuthorChapterDetailFeature() {
  const { novelId, chapterNumber } = useParams<{ novelId: string; chapterNumber: string }>()
  const isNew = !chapterNumber || chapterNumber === 'new'
  const parsedChapterNumber = isNew ? undefined : parseInt(chapterNumber!)

  const { data: chapter, isLoading, error } = useChapterDetails(
    novelId,
    parsedChapterNumber
  )

  const { data: chapters } = useChapters(novelId)
  const existingChapterNumbers = chapters ? chapters.map(c => c.chapterNumber) : []

  if (!isNew && isLoading) {
    return (
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        Đang tải nội dung chi tiết chương truyện...
      </div>
    )
  }

  if (!isNew && error) {
    return (
      <div className="container mx-auto text-center text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg">
        Không thể tải chi tiết chương: {error instanceof Error ? error.message : 'Lỗi hệ thống'}
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <ChapterForm
        novelId={novelId || ''}
        chapter={isNew ? undefined : chapter}
        existingChapterNumbers={existingChapterNumbers}
      />
    </div>
  )
}
