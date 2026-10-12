import { useParams } from 'react-router-dom'
import { ReaderProvider } from './context/reader-context'
import ReaderContent from './components/reader-content'

export default function ReaderFeature() {
  const { chapterSlug } = useParams<{ chapterSlug: string }>()

  return (
    <ReaderProvider initialChapterId={chapterSlug || 'chuong-1-tia-lua-dau-tien-1'}>
      <ReaderContent />
    </ReaderProvider>
  )
}