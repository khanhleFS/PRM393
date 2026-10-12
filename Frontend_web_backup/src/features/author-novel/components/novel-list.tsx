import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Plus, Search } from 'lucide-react'
import { useMyNovels } from '../hooks/use-author-novels'
import type { NovelResponseDTO } from '@/types'

// Bỏ tuỳ chọn 'ALL'
const STATUS_OPTIONS = [
  { value: 'ONGOING', label: 'Chưa kết thúc' },
  { value: 'COMPLETED', label: 'Kết thúc' },
  { value: 'PAUSED', label: 'Tạm ngưng' },
  { value: 'DROPPED', label: 'Đã hủy' },
]

export function NovelList() {
  const { data: novels, isLoading, error } = useMyNovels()
  const [searchQuery, setSearchQuery] = useState('')
  // State dạng mảng để chứa nhiều trạng thái (hoạt động như checkbox)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  const filteredNovels = useMemo(() => {
    if (!novels) return []

    return novels.filter((novel) => {
      // 1. Lọc theo Search Query
      const matchSearch =
        !searchQuery.trim() ||
        novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase()))

      // 2. Lọc theo Status (Nếu mảng rỗng thì coi như không lọc / hiển thị tất cả)
      const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(novel.status)

      return matchSearch && matchStatus
    })
  }, [novels, searchQuery, selectedStatuses])

  // Hàm xử lý toggle (check/uncheck) chip
  const toggleStatus = (statusValue: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusValue)
        ? prev.filter((s) => s !== statusValue) // Nếu đã chọn thì bỏ chọn
        : [...prev, statusValue] // Nếu chưa chọn thì thêm vào mảng
    )
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl border border-outline-variant bg-surface-container-low p-4" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-600">
        Đã có lỗi xảy ra: {error instanceof Error ? error.message : 'Không thể tải danh sách truyện'}
      </div>
    )
  }

  if (!novels || novels.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-low p-8 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <h3 className="mt-4 text-lg font-bold text-foreground">Bạn chưa có truyện nào</h3>
        <p className="mt-2 text-sm text-muted-foreground">Bắt đầu hành trình sáng tác bằng cách tạo tác phẩm đầu tay.</p>
        <div className="mt-6">
          <Link
            to="/author/novels/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Tạo truyện mới
          </Link>
        </div>
      </div>
    )
  }

  return (
    // 1. Thêm w-full vào thẻ div bọc ngoài cùng nhất để ép nó luôn chiếm 100% component cha
    <div className="w-full space-y-6">

      {/* 2. Thêm w-full vào container chứa Search Bar và Chips */}
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">

        {/* Cột 1: Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm truyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-outline-variant bg-surface-container-low pl-9 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Cột 2: Filter Chips */}
        <div className="flex flex-wrap items-center gap-4 md:justify-end">
          {STATUS_OPTIONS.map((option) => {
            const isSelected = selectedStatuses.includes(option.value)
            return (
              <button
                key={option.value}
                onClick={() => toggleStatus(option.value)}
                className={`inline-flex h-9 items-center justify-center rounded-full border px-4 text-sm font-semibold transition-colors duration-200 ${isSelected
                  ? 'border-primary bg-primary text-on-primary shadow-sm'
                  : 'border-outline-variant bg-surface-container-low text-muted-foreground hover:bg-surface-container hover:text-foreground'
                  }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        {/* Cột 3: Create Button */}
        <Link
          to="/author/novels/new"
          className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 md:w-auto"
        >
          <Plus className="h-4 w-4" /> Tạo truyện
        </Link>
      </div>

      {/* Novel List / Empty Search State */}
      {filteredNovels.length > 0 ? (
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNovels.map((novel) => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      ) : (
        <div className="flex w-full min-h-[200px] flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant px-6 py-12 text-center">
          <p className="w-full break-words text-sm text-muted-foreground">
            Không tìm thấy truyện nào khớp với từ khóa "<span className="break-all font-bold text-foreground">{searchQuery}</span>"
            {selectedStatuses.length > 0 && ` trong các trạng thái đã chọn`}
          </p>
        </div>
      )}
    </div>
  )
}

function NovelCard({ novel }: { novel: NovelResponseDTO }) {
  const statusLabels: Record<string, string> = {
    ONGOING: 'Chưa kết thúc',
    COMPLETED: 'Kết thúc',
    PAUSED: 'Tạm ngưng',
    DROPPED: 'Đã hủy',
  }

  const statusColors: Record<string, string> = {
    ONGOING: 'border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400',
    COMPLETED: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    PAUSED: 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    DROPPED: 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return (
    <Link
      to={`/author/novels/${novel.id}`}
      className="group relative flex flex-col overflow-hidden rounded-md border border-outline-variant bg-surface-container-low p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div className="flex gap-4">
        {/* Cover Image */}
        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-md border border-outline-variant bg-surface-container">
          {novel.coverImageUrl ? (
            <img src={novel.coverImageUrl} alt={novel.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-muted-foreground dark:bg-gray-800">
              <BookOpen className="h-6 w-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${statusColors[novel.status] || 'border-gray-500/20 bg-gray-500/10 text-gray-600'}`}>
            {statusLabels[novel.status] || novel.status}
          </span>
          <h3 className="mt-1 truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
            {novel.title}
          </h3>
          <p className="mt-1 line-clamp-2 leading-relaxed text-[10px] text-muted-foreground">
            {novel.description || 'Chưa có mô tả ngắn...'}
          </p>

          {/* Meta Stats: Current Chapter */}
          <span className="text-[10px] font-semibold text-muted-foreground">
            {novel.chapterCount ? `Chương ${novel.chapterCount}` : 'Chưa có chương'}
          </span>
        </div>
      </div>

      {/* Category Badges */}
      {novel.categories && novel.categories.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-outline-variant/50 pt-2.5">
          {novel.categories.slice(0, 4).map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
            >
              {cat}
            </span>
          ))}
          {novel.categories.length > 4 && (
            <span className="rounded-full border border-outline-variant bg-surface-container px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{novel.categories.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}