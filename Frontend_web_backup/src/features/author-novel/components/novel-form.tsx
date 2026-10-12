import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Upload, X, Loader2, Save, ArrowLeft } from 'lucide-react'
import { useCreateNovel, useUpdateNovel } from '../hooks/use-author-novels'
import { getAllCategories } from '@/services/category-service'
import { getNovelEnums, uploadNovelImage } from '@/services/novel-service'
import type { NovelStatus } from '@/types'
import type { NovelFormProps } from '../types/author-novel.types'
import { ChapterList } from './chapter-list'

export function NovelForm({ novel }: NovelFormProps) {
  const navigate = useNavigate()
  const isEdit = !!novel

  // Forms states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<NovelStatus>('ONGOING')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Image Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  })

  // Fetch novel enums
  const { data: enums } = useQuery({
    queryKey: ['novelEnums'],
    queryFn: getNovelEnums,
  })

  const statusOptions = enums?.find(e => e.name === 'NovelStatus')?.value || ['ONGOING', 'COMPLETED', 'CANCELLED']

  // Mutation hooks
  const createMutation = useCreateNovel()
  const updateMutation = useUpdateNovel(novel?.id ? String(novel.id) : '')

  // Initialize form when novel data is loaded (Edit mode)
  useEffect(() => {
    if (novel) {
      setTitle(novel.title)
      setDescription(novel.description || '')
      setStatus(novel.status)
      setCoverImageUrl(novel.coverImageUrl || '')

      // Map category names to IDs if category list is fetched
      if (categories && novel.categories) {
        const matchedIds = categories
          .filter(cat => novel.categories.includes(cat.name))
          .map(cat => cat.id)
        setSelectedCategories(matchedIds)
      }
    }
  }, [novel, categories])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadError(null)
    try {
      const url = await uploadNovelImage(file)
      setCoverImageUrl(url)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Tải lên hình ảnh thất bại')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setSubmitError(null)

    const payload = {
      title,
      description,
      status,
      coverImageUrl,
      categoryIds: selectedCategories,
    }

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload)
        navigate('/author/novels')
      } else {
        const created = await createMutation.mutateAsync(payload)
        navigate(`/author/novels/${created.id}`)
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/author/novels')}
            className="rounded-lg border border-outline-variant p-2 text-muted-foreground transition-all hover:bg-surface-container active:scale-95"
            title="Quay lại"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? 'Chỉnh sửa tác phẩm' : 'Tạo tác phẩm mới'}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEdit ? 'Cập nhật nội dung chi tiết của truyện' : 'Thêm một bộ truyện mới vào kho tác phẩm của bạn'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main inputs */}
        <div className="space-y-5 lg:col-span-2 rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">
          <div className="space-y-2">
            <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Tên tác phẩm</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Nhập tên truyện..."
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Giới thiệu tóm tắt</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Nhập tóm tắt truyện..."
              rows={6}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none resize-y"
            />
          </div>

          {/* Categories select list */}
          <div className="space-y-2">
            <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Thể loại</label>
            <div className="flex flex-wrap gap-2">
              {categories?.map(cat => {
                const isSelected = selectedCategories.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${isSelected
                      ? 'border-primary bg-primary text-on-primary shadow-sm'
                      : 'border-outline-variant bg-surface-container-lowest text-muted-foreground hover:bg-surface-container'
                      }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info & Cover */}
        <div className="space-y-5 rounded-xl border border-outline-variant bg-surface-container-low p-5 shadow-sm">

          {/* Cover image uploader */}
          <div className="space-y-2">
            <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Ảnh bìa truyện</label>

            <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-4 transition-all hover:bg-surface-container/30">
              {coverImageUrl ? (
                <div className="relative group overflow-hidden rounded-md border border-outline-variant h-48 w-32 shadow-sm">
                  <img src={coverImageUrl} alt="Preview cover" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl('')}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white hover:bg-black transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer py-8 w-full">
                  <Upload className="h-8 w-8 text-muted-foreground opacity-60" />
                  <span className="mt-2 text-xs font-semibold text-primary">Tải lên ảnh bìa</span>
                  <span className="mt-1 text-[10px] text-muted-foreground">Hỗ trợ JPG, PNG</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}

              {isUploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg bg-black/40 backdrop-blur-[1px] text-white">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="mt-2 text-xs font-medium">Đang tải lên...</span>
                </div>
              )}
            </div>
            {uploadError && <p className="text-[11px] text-red-600 font-semibold">{uploadError}</p>}
          </div>

          <div className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <label className="block mb-3 text-xs font-bold uppercase tracking-wider text-foreground">Trạng thái xuất bản</label>
              <div className="relative flex items-center w-full">
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as NovelStatus)}
                  className="appearance-none w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-4 pr-10 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  {statusOptions.map(opt => {
                    let label = opt
                    if (opt === 'ONGOING') label = 'Đang tiến hành (Ongoing)'
                    else if (opt === 'COMPLETED') label = 'Kết thúc (Completed)'
                    else if (opt === 'CANCELLED') label = 'Đã hủy (Cancelled)'
                    return (
                      <option key={opt} value={opt}>
                        {label}
                      </option>
                    )
                  })}
                </select>

                <div className="pointer-events-none absolute right-3 text-foreground/75">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit error */}
            {submitError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400">
                ⚠ {submitError}
              </p>
            )}

            {/* Action buttons */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-bold text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Lưu dữ liệu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> {isEdit ? 'Lưu thay đổi' : 'Tạo truyện'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Chapters list under form (only when editing) */}
      {isEdit && (
        <div className="border-t border-outline-variant pt-8">
          <ChapterList novelId={String(novel.id)} />
        </div>
      )}
    </div>
  )
}