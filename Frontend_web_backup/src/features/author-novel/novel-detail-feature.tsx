import { useParams } from 'react-router-dom'
import { NovelForm } from './components/novel-form'
import { useNovel } from './hooks/use-author-novels'

export default function AuthorNovelDetailFeature() {
  const { novelId } = useParams<{ novelId: string }>()
  const isNew = !novelId || novelId === 'new'

  const { data: novel, isLoading, error } = useNovel(isNew ? undefined : novelId)

  if (!isNew && isLoading) {
    return (
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        Đang tải thông tin chi tiết truyện...
      </div>
    )
  }

  if (!isNew && error) {
    return (
      <div className="container mx-auto text-center text-sm text-red-600 bg-red-500/10 border border-red-500/20 rounded-lg">
        Không thể tải chi tiết truyện: {error instanceof Error ? error.message : 'Lỗi hệ thống'}
      </div>
    )
  }

  return (
    <div className="container mx-auto">
      <NovelForm novel={isNew ? undefined : novel} />
    </div>
  )
}
