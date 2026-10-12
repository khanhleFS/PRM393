import { api } from '@/lib/api'
import type { OrderRequestDTO, OrderResponseDTO } from '@/types'

/**
 * Tạo một đơn hàng mua gói coin mới.
 * Backend sẽ tự động tạo Payment PENDING và gọi MoMo để lấy payUrl.
 * Response sẽ chứa payUrl để redirect user sang trang thanh toán MoMo.
 */
export async function createOrder(request: OrderRequestDTO): Promise<OrderResponseDTO> {
  const response = await api.post('/orders', request)
  if (response.data && (response.data.code === 201 || response.data.code === 200)) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Tạo đơn hàng thất bại')
}

/**
 * Lấy danh sách các đơn hàng của người dùng đang đăng nhập.
 */
export async function getMyOrders(): Promise<OrderResponseDTO[]> {
  const response = await api.get('/orders')
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Lấy danh sách đơn hàng thất bại')
}

/**
 * Gọi lại MoMo để lấy link thanh toán cho đơn hàng PENDING cũ.
 */
export async function recreateMomoPayment(orderId: string, requestType: string = 'captureWallet'): Promise<OrderResponseDTO> {
  const response = await api.post(`/orders/${orderId}/payment?requestType=${requestType}`)
  if (response.data && response.data.code === 200) {
    return response.data.result
  }
  throw new Error(response.data?.message || 'Lấy lại link thanh toán thất bại')
}
