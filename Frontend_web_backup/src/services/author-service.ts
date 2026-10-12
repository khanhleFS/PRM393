import { api } from '@/lib/api'
import type {
  CreateAuthorRequestDTO,
  AuthorProfileResponseDTO,
  AuthorProfileRequestDTO,
  AuthorPaymentTicketDTO,
  AuthorDashboardDTO,
  TicketStatus
} from '@/types'

// ============================================================================
// 1. ADMIN APIs (/api/admin)
// ============================================================================

/**
 * Admin tạo tài khoản Tác giả mới.
 * Endpoint: POST /api/admin/authors
 */
export async function createAuthorByAdmin(
  request: CreateAuthorRequestDTO
): Promise<AuthorProfileResponseDTO> {
  const response = await api.post('/admin/authors', request)
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorProfileResponseDTO
  }
  throw new Error(response.data?.message || 'Tạo tài khoản tác giả thất bại')
}

/**
 * Admin xem danh sách tất cả hồ sơ tác giả.
 * Endpoint: GET /api/admin/author-profiles
 */
export async function getAllAuthorProfilesByAdmin(): Promise<AuthorProfileResponseDTO[]> {
  const response = await api.get('/admin/author-profiles')
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorProfileResponseDTO[]
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách hồ sơ tác giả')
}

/**
 * Admin xem danh sách ticket quyết toán hàng tháng (UNPAID, PAID, CANCELLED).
 * Endpoint: GET /api/admin/author-payouts/tickets
 */
export async function getAllPayoutTicketsByAdmin(
  status?: TicketStatus
): Promise<AuthorPaymentTicketDTO[]> {
  const response = await api.get('/admin/author-payouts/tickets', {
    params: status ? { status } : {}
  })
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorPaymentTicketDTO[]
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách phiếu quyết toán')
}

/**
 * Admin xác nhận đã thanh toán ticket (PAID) hoặc chuyển đổi trạng thái.
 * Endpoint: PUT /api/admin/author-payouts/tickets/{ticketId}/pay
 */
export async function payTicketByAdmin(
  ticketId: string,
  transactionRef?: string,
  status: TicketStatus = 'PAID'
): Promise<AuthorPaymentTicketDTO> {
  const params: Record<string, string> = { status }
  if (transactionRef) {
    params.transactionRef = transactionRef
  }

  const response = await api.put(`/admin/author-payouts/tickets/${ticketId}/pay`, null, { params })
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorPaymentTicketDTO
  }
  throw new Error(response.data?.message || 'Xác nhận thanh toán ticket thất bại')
}

/**
 * Admin kích hoạt thủ công chốt sổ tháng (Dùng cho test).
 * Endpoint: POST /api/admin/author-payouts/trigger-scheduler
 */
export async function triggerMonthlySchedulerByAdmin(): Promise<void> {
  const response = await api.post('/admin/author-payouts/trigger-scheduler')
  if (response.data && response.data.code === 200) {
    return
  }
  throw new Error(response.data?.message || 'Kích hoạt chốt sổ tháng thất bại')
}

// ============================================================================
// 2. AUTHOR DASHBOARD APIs (/api/author)
// ============================================================================

/**
 * Lấy hồ sơ tác giả cá nhân của tài khoản đang đăng nhập.
 * Endpoint: GET /api/author/profile
 */
export async function getAuthorProfile(): Promise<AuthorProfileResponseDTO> {
  const response = await api.get('/author/profile')
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorProfileResponseDTO
  }
  throw new Error(response.data?.message || 'Không thể lấy thông tin hồ sơ tác giả')
}

/**
 * Cập nhật hồ sơ tác giả & thông tin tài khoản ngân hàng cá nhân.
 * Endpoint: PUT /api/author/profile
 */
export async function updateAuthorProfile(
  request: AuthorProfileRequestDTO
): Promise<AuthorProfileResponseDTO> {
  const response = await api.put('/author/profile', request)
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorProfileResponseDTO
  }
  throw new Error(response.data?.message || 'Cập nhật hồ sơ tác giả thất bại')
}

/**
 * Lấy thông tin tổng quan Author Dashboard.
 * Endpoint: GET /api/author/dashboard
 */
export async function getAuthorDashboard(): Promise<AuthorDashboardDTO> {
  const response = await api.get('/author/dashboard')
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorDashboardDTO
  }
  throw new Error(response.data?.message || 'Không thể tải thông tin Author Dashboard')
}

/**
 * Lấy danh sách ticket quyết toán cá nhân của tác giả.
 * Endpoint: GET /api/author/tickets
 */
export async function getAuthorTickets(): Promise<AuthorPaymentTicketDTO[]> {
  const response = await api.get('/author/tickets')
  if (response.data && response.data.code === 200) {
    return response.data.result as AuthorPaymentTicketDTO[]
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách ticket cá nhân')
}
