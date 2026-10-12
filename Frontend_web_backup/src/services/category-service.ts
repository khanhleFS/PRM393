import { api } from '@/lib/api'
import type { CategoryRequestDTO, CategoryResponseDTO } from '@/types'

/**
 * Lấy danh sách tất cả thể loại / phân loại.
 * Endpoint: GET /api/categories (Public - Guest/Reader/Author/Admin)
 */
export async function getAllCategories(): Promise<CategoryResponseDTO[]> {
  const response = await api.get('/categories')
  if (response.data && response.data.code === 200) {
    return response.data.result as CategoryResponseDTO[]
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách thể loại')
}

/**
 * Lấy thông tin chi tiết một thể loại theo ID.
 * Endpoint: GET /api/categories/{id} (Public)
 */
export async function getCategoryById(id: string): Promise<CategoryResponseDTO> {
  const response = await api.get(`/categories/${id}`)
  if (response.data && response.data.code === 200) {
    return response.data.result as CategoryResponseDTO
  }
  throw new Error(response.data?.message || 'Không thể tải thông tin thể loại')
}

/**
 * Tạo mới thể loại (Quyền: ADMIN & AUTHOR).
 * Endpoint: POST /api/admin/categories
 */
export async function createCategory(request: CategoryRequestDTO): Promise<CategoryResponseDTO> {
  const response = await api.post('/admin/categories', request)
  if (response.data && (response.data.code === 200 || response.data.code === 201)) {
    return response.data.result as CategoryResponseDTO
  }
  throw new Error(response.data?.message || 'Tạo thể loại thất bại')
}

/**
 * Cập nhật tên thể loại theo ID (Quyền: ADMIN & AUTHOR).
 * Endpoint: PUT /api/admin/categories/{id}
 */
export async function updateCategory(
  id: string,
  request: CategoryRequestDTO
): Promise<CategoryResponseDTO> {
  const response = await api.put(`/admin/categories/${id}`, request)
  if (response.data && response.data.code === 200) {
    return response.data.result as CategoryResponseDTO
  }
  throw new Error(response.data?.message || 'Cập nhật thể loại thất bại')
}

/**
 * Xóa thể loại theo ID (Quyền: ADMIN & AUTHOR).
 * Endpoint: DELETE /api/admin/categories/{id}
 */
export async function deleteCategory(id: string): Promise<void> {
  const response = await api.delete(`/admin/categories/${id}`)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Xóa thể loại thất bại')
}
