import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Loader2, ChevronDown, AlertTriangle } from 'lucide-react'
import { useCreateChapter, useUpdateChapter } from '../hooks/use-author-novels'
import type { ChapterStatus } from '@/types'
import type { ChapterFormProps } from '../types/author-novel.types'
import { decryptContent } from '@/features/reader/services/reader.service'

const CHAPTER_STATUS_OPTIONS: { value: ChapterStatus; label: string }[] = [
  { value: 'FREE', label: 'Miễn phí (Free)' },
  { value: 'UNLOCKED', label: 'Trả phí (Unlocked)' },
  { value: 'LOCKED', label: 'Khoá (Locked)' },
]

// Danh sách pattern nghi vấn: script tag, sql injection phổ biến, event handler inline...
// Đây chỉ là cảnh báo UX phía client, KHÔNG thay thế cho việc BE dùng parameterized query / sanitize output.
const SUSPICIOUS_CONTENT_PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /[<>]/, label: 'kí tự đặc biệt < hoặc >' },
  { regex: /<script[\s>]/i, label: 'thẻ <script>' },
  { regex: /<\s*iframe[\s>]/i, label: 'thẻ <iframe>' },
  { regex: /on\w+\s*=\s*["']/i, label: 'thuộc tính sự kiện (onClick, onError,...)' },
  { regex: /javascript\s*:/i, label: 'giao thức javascript:' },
  { regex: /(\bUNION\b\s+\bSELECT\b)/i, label: 'cú pháp UNION SELECT' },
  { regex: /(;|\b)(DROP|DELETE|TRUNCATE)\s+(TABLE|FROM)\b/i, label: 'câu lệnh DROP/DELETE/TRUNCATE' },
  { regex: /--\s*$/m, label: 'chuỗi comment SQL (--) cuối dòng' },
  { regex: /\/\*.*?\*\//s, label: 'khối comment SQL (/* */)' },
]

function findSuspiciousPattern(text: string): string | null {
  for (const { regex, label } of SUSPICIOUS_CONTENT_PATTERNS) {
    if (regex.test(text)) return label
  }
  return null
}

export function ChapterForm({ novelId, chapter, existingChapterNumbers = [] }: ChapterFormProps) {
  const navigate = useNavigate()
  const isEdit = !!chapter

  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [status, setStatus] = useState<ChapterStatus>('FREE')
  const [chapterNumber, setChapterNumber] = useState<number | null>(null)
  const [contentWarning, setContentWarning] = useState<string | null>(null)

  // Invalidate and sync mutations
  const createMutation = useCreateChapter(novelId)
  const updateMutation = useUpdateChapter(novelId, chapter?.id ? String(chapter.id) : '')

  // Initialize form fields
  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title)
      let initialContent = chapter.content || ''
      if (chapter.encryptedData && chapter.iv) {
        initialContent = decryptContent(chapter.encryptedData, chapter.iv, chapter.novelId, chapter.chapterNumber) || initialContent
      }
      setContent(initialContent)
      setStatus(chapter.status)
      setChapterNumber(chapter.chapterNumber)
    } else if (existingChapterNumbers.length > 0) {
      const maxExisting = Math.max(...existingChapterNumbers)
      setChapterNumber(maxExisting + 1)
    } else {
      setChapterNumber(1)
    }
  }, [chapter, existingChapterNumbers])

  // Set các số chương đã bị chiếm (loại trừ số hiện tại nếu đang edit, vì chương đó có quyền giữ số của chính nó)
  const takenNumbers = useMemo(() => {
    const set = new Set(existingChapterNumbers)
    if (isEdit && chapter) set.delete(chapter.chapterNumber)
    return set
  }, [existingChapterNumbers, isEdit, chapter])

  // Danh sách số để hiển thị trong dropdown: từ 1 tới (max đã tồn tại + 5 chương trống tiếp theo)
  const numberOptions = useMemo(() => {
    const maxExisting = existingChapterNumbers.length > 0 ? Math.max(...existingChapterNumbers) : 0
    const upperBound = Math.max(maxExisting + 5, 20)
    return Array.from({ length: upperBound }, (_, i) => i + 1)
  }, [existingChapterNumbers])

  const handleContentChange = (value: string) => {
    setContent(value)
    setContentWarning(findSuspiciousPattern(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !chapterNumber) return

    // Chặn submit nếu nội dung chứa pattern nghi vấn
    const suspicious = findSuspiciousPattern(content) || findSuspiciousPattern(title)
    if (suspicious) {
      setContentWarning(suspicious)
      return
    }

    const payload = {
      title,
      content,
      status,
      chapterNumber,
      coinPrice: status === 'FREE' ? 0 : 5, // Giá cố định
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
      } else {
        await createMutation.mutateAsync(payload)
      }
      navigate(`/author/novels/${novelId}`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu chương truyện thất bại')
    }
  }


  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/author/novels/${novelId}`)}
            className="rounded-lg border border-outline-variant p-2 text-muted-foreground transition-all hover:bg-surface-container active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-sans">
              {isEdit ? `Chỉnh sửa chương ${chapter?.chapterNumber}` : 'Thêm chương mới'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? 'Chỉnh sửa tiêu đề, nội dung và cài đặt TTS cho chương' : 'Nhập nội dung cho chương truyện mới'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        {/* Editor Main */}
        <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Chọn số thứ tự chương - dạng dropdown, disable số đã tồn tại */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Số thứ tự chương</label>
              <div className="relative">
                <select
                  required
                  value={chapterNumber ?? ''}
                  onChange={e => setChapterNumber(Number(e.target.value))}
                  className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-sm text-on-surface focus:border-primary focus:outline-none font-mono cursor-pointer"
                >
                  <option value="" disabled>Chọn số chương</option>
                  {numberOptions.map(num => (
                    <option key={num} value={num} disabled={takenNumbers.has(num)}>
                      Chương {num}{takenNumbers.has(num) ? ' (đã dùng)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              </div>
            </div>

            {/* Trạng thái - custom select, icon riêng thay indicator mặc định */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Trạng thái chương</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as ChapterStatus)}
                  className="w-full appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {CHAPTER_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              </div>
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">Tiêu đề chương</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ví dụ: Chương 1: Sự khởi đầu mới..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none font-semibold"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">Nội dung chương</label>
              {contentWarning && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" /> Phát hiện nội dung bất thường
                </span>
              )}
            </div>
            <textarea
              required
              value={content}
              onChange={e => handleContentChange(e.target.value)}
              placeholder="Soạn nội dung chương truyện ở đây..."
              rows={16}
              className={`w-full rounded-lg border bg-surface-container-lowest px-4 py-3 text-sm text-foreground font-serif leading-relaxed focus:outline-none resize-y ${contentWarning ? 'border-amber-500 focus:border-amber-500' : 'border-outline-variant focus:border-primary'
                }`}
            />
            {contentWarning && (
              <p className="text-xs text-amber-600">
                Nội dung có chứa {contentWarning}. Vui lòng kiểm tra lại trước khi lưu — chương sẽ không được lưu nếu còn nội dung này.
              </p>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={isSaving || !!contentWarning}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Lưu chương truyện
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/author/novels/${novelId}`)}
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-surface-container transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
