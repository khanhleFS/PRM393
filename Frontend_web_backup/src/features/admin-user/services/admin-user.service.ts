import { api } from '@/lib/api'
import type { UserItem, UserManagementData, UserRole } from '../types/admin-user.types'

/**
 * Fetch all users for admin management.
 * GET /api/admin/users (Admin only)
 */
export async function fetchUserManagementData(): Promise<UserManagementData> {
  const response = await api.get('/admin/users')
  if (response.data && response.data.code === 200) {
    const users: UserItem[] = (response.data.result as any[]).map((u: any) => ({
      id: u.id,
      username: u.username ?? '',
      fullName: u.username ?? '',
      email: u.email ?? '',
      role: u.isAuthor ? 'AUTHOR' : (u.role as UserRole),
      isAuthor: !!u.isAuthor,
      isActive: u.isActive !== false,
      coinBalance: u.coinBalance ?? 0,
      joinedAt: u.createdAt ?? '',
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username ?? 'U')}&background=random`,
      novelCount: 0,
      totalReads: 0,
      walletBalance: u.coinBalance ?? 0,
      status: u.isActive === false ? 'banned' : 'active',
    }))

    const active = users.filter((u) => u.status === 'active').length
    const banned = users.filter((u) => u.status === 'banned').length
    const authors = users.filter((u) => u.isAuthor).length

    return {
      stats: {
        totalUsers: users.length,
        activeUsers: active,
        bannedUsers: banned,
        newThisMonth: 0,
        totalAuthors: authors,
        pendingRequests: 0,
      },
      users,
    }
  }
  throw new Error(response.data?.message || 'Không thể tải danh sách người dùng')
}

/**
 * Create a new author account.
 * POST /api/admin/authors
 */
export async function createAuthor(payload: any): Promise<void> {
  await api.post('/admin/authors', payload)
}

/**
 * Toggle ban/unban user.
 * PUT /api/admin/users/{userId}/toggle-ban (Admin only)
 */
export async function toggleBanUser(userId: string): Promise<UserItem> {
  await api.put(`/admin/users/${userId}/toggle-ban`)
  const data = await fetchUserManagementData()
  return data.users.find((u) => u.id === userId) ?? ({ id: userId } as UserItem)
}

/**
 * Approve pending user.
 */
export async function approvePendingUser(userId: string): Promise<UserItem> {
  const data = await fetchUserManagementData()
  return data.users.find((u) => u.id === userId) ?? ({ id: userId } as UserItem)
}
