import { api } from '@/lib/api'
import type { CoinCreateRequestDTO, CoinCreateResponseDTO, EnumResponseDTO } from '@/types'


/**
 * Fetches active coin packages from the public endpoint.
 */
export async function getActiveCoinPackages(): Promise<CoinCreateResponseDTO[]> {
  const response = await api.get('/coin-packages')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải các gói xu hoạt động')
}

/**
 * Fetches all coin packages from the admin endpoint.
 */
export async function getAllCoinPackagesAdmin(): Promise<CoinCreateResponseDTO[]> {
  const response = await api.get('/coin-packages/admin')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải toàn bộ danh sách gói xu')
}

/**
 * Creates a new coin package (Admin access required).
 */
export async function createCoinPackage(request: CoinCreateRequestDTO): Promise<CoinCreateResponseDTO> {
  const response = await api.post('/coin-packages/admin', request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Tạo gói xu thất bại')
}

/**
 * Updates an existing coin package (Admin access required).
 */
export async function updateCoinPackage(id: string, request: CoinCreateRequestDTO): Promise<CoinCreateResponseDTO> {
  const response = await api.put(`/coin-packages/admin/${id}`, request)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Cập nhật gói xu thất bại')
}

/**
 * Toggles coin package status (Admin access required).
 */
export async function toggleCoinPackageStatus(id: string): Promise<CoinCreateResponseDTO> {
  const response = await api.patch(`/coin-packages/admin/${id}/toggle`)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Thay đổi trạng thái gói xu thất bại')
}

/**
 * Deletes a coin package (Admin access required).
 */
export async function deleteCoinPackage(id: string): Promise<void> {
  const response = await api.delete(`/coin-packages/admin/${id}`)
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Xóa gói xu thất bại')
}

/**
 * Lấy danh sách enum của Coin (CoinTransactionType) từ backend.
 */
export async function getCoinEnums(): Promise<EnumResponseDTO[]> {
  const response = await api.get('/coin-packages/enums')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Không thể tải enums của gói coin')
}

