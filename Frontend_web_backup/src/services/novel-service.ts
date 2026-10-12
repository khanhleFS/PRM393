import { api } from '@/lib/api'
import type { NovelRequestDTO, NovelResponseDTO, NovelPageResponseDTO, EnumResponseDTO } from '@/types'


/**
 * Creates a new novel (Author access required).
 */
export async function createNovel(request: NovelRequestDTO): Promise<NovelResponseDTO> {
  const response = await api.post('/author/novels', request)
  if (response.data && (response.data.code === 201 || response.data.code === 200)) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Tạo truyện mới thất bại')
}

/**
 * Fetches all novels created by the currently authenticated author.
 */
export async function getMyNovels(): Promise<NovelResponseDTO[]> {
  const response = await api.get('/author/novels')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách truyện của tôi')
}

/**
 * Fetches detail of a single novel by ID.
 */
export async function getNovelById(id: string | number): Promise<NovelResponseDTO> {
  const response = await api.get(`/author/novels/${id}`)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải chi tiết truyện')
}

/**
 * Updates an existing novel (Author access required).
 */
export async function updateNovel(id: string | number, request: NovelRequestDTO): Promise<NovelResponseDTO> {
  const response = await api.put(`/author/novels/${id}`, request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Cập nhật thông tin truyện thất bại')
}

/**
 * Deletes a novel (Author access required).
 */
export async function deleteNovel(id: string | number): Promise<void> {
  const response = await api.delete(`/author/novels/${id}`)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Xóa truyện thất bại')
}

/**
 * Lấy danh sách enum của Novel (NovelStatus) từ backend (Author-only).
 */
export async function getNovelEnums(): Promise<EnumResponseDTO[]> {
  const response = await api.get('/author/novels/enums')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải enums của truyện')
}

/**
 * Lấy danh sách enum của Novel (NovelStatus) từ public endpoint (không cần auth).
 */
export async function getPublicNovelEnums(): Promise<EnumResponseDTO[]> {
  const response = await api.get('/novels/enums')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải enums của truyện')
}

/**
 * Fetches public details of a single novel by ID for readers/guests.
 */
export async function getPublicNovelById(id: string | number): Promise<NovelResponseDTO> {
  const response = await api.get(`/novels/${id}`)
  if (response.data && (response.data.code === 200 || response.status === 200)) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải chi tiết truyện')
}

/**
 * Searches/lists public novels with optional filters and pagination.
 */
export async function searchNovels(params: {
  q?: string
  category?: string
  status?: string
  minChapters?: number
  page?: number
  size?: number
}): Promise<NovelPageResponseDTO> {
  const response = await api.get('/novels', {
    params: {
      q: params.q || undefined,
      category: params.category || undefined,
      status: params.status || undefined,
      minChapters: params.minChapters || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    }
  })
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách truyện')
}
/**
 * Fetches chapter-level statistics for a novel (Author access required).
 * Endpoint: GET /author/novels/{id}/stats
 */
export async function getNovelStats(novelId: number | string): Promise<{
  totalViews: number
  totalRevenue: number
  avgConversionRate: number
  chapters: {
    chapterId: number
    chapterNumber: number
    title: string
    status: string
    viewCount: number
    revenue: number
    conversionRate: number
  }[]
}> {
  const response = await api.get(`/author/novels/${novelId}/stats`)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải thống kê truyện')
}

/**
 * Uploads a novel cover/image (Author access required).
 * Endpoint: POST /author/novels/upload-image
 * @param file The image file to upload.
 * @returns Promise resolving to the Cloudinary image URL.
 */
export async function uploadNovelImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file) // Đảm bảo key 'file' khớp với backend requirement

  const response = await api.post('/author/novels/upload-image', formData, {
    headers: {
      'Content-Type': undefined, // Xóa default 'application/json', để Axios tự set multipart/form-data với boundary
    },
  })

  // Theo chuẩn ApiResponse<String> của backend
  if (response.data && response.data.code === 200) {
    return response.data.result
  }

  throw new Error(response.data?.message || 'Upload ảnh truyện thất bại')
}