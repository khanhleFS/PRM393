import { api } from '@/lib/api'
import type { AdminDashboardData, DashboardData } from '../types/admin-dashboard.types'

export type { AdminDashboardData, DashboardData }

/**
 * Fetches admin dashboard statistics.
 * Endpoint: GET /api/admin/dashboard (ADMIN only)
 */
export async function fetchDashboardData(): Promise<AdminDashboardData> {
  const response = await api.get('/admin/dashboard')
  if (response.data && response.data.code === 200) {
    return response.data.result as AdminDashboardData
  }
  throw new Error(response.data?.message || 'Không thể tải thống kê dashboard')
}
