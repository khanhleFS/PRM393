import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { queryClient } from '@/lib/query-client'
import { logoutUser, getUserProfile } from '@/services/auth-service'
import type { User } from '@/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  /** Authenticated user, or null when logged out */
  user: User | null
  /** JWT token, or null when logged out */
  token: string | null
  /** Refresh token stored in memory if cookies are rejected */
  refreshToken: string | null
  /** True while verifying token / fetching profile on startup */
  isLoading: boolean

  // ── Derived ──────────────────────────────────────────────────────────────
  /** Convenience getter: true when a user is present */
  isAuthenticated: boolean

  // ── Actions ──────────────────────────────────────────────────────────────
  /** Persist user + token after successful login */
  login: (user: User, token: string, refreshToken?: string) => void
  /** Clear state and call the backend logout endpoint */
  logout: () => Promise<void>
  /** Re-fetch profile from the backend and update the stored user */
  refreshProfile: () => Promise<void>
  /** Internal: update loading flag */
  _setLoading: (v: boolean) => void
  /** Internal: update user without touching the token */
  _setUser: (user: User | null) => void
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // ── Initial state ──────────────────────────────────────────────────
      user: null,
      token: null,
      refreshToken: null,
      isLoading: true,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────
      login(user, token, refreshToken) {
        set({ user, token, refreshToken: refreshToken || null, isAuthenticated: true, isLoading: false })
      },

      async logout() {
        try {
          await logoutUser()
        } catch (err) {
          console.warn('Backend logout call failed:', err)
        } finally {
          // Xóa cache của TanStack Query để tránh rò rỉ dữ liệu cũ sang user mới
          queryClient.clear()
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false })
        }
      },

      async refreshProfile() {
        const { token, refreshToken: stateRefreshToken, _setUser, _setLoading } = get()

        // Nếu không có token trên RAM, thử thực hiện gọi refresh token qua cookie hoặc RAM
        if (!token) {
          try {
            const { refreshToken } = await import('@/services/auth-service')
            const tokenToUse = stateRefreshToken || ''
            const refreshRes = await refreshToken({ refreshToken: tokenToUse })
            if (refreshRes && refreshRes.accessToken) {
              set({
                token: refreshRes.accessToken,
                refreshToken: refreshRes.refreshToken || stateRefreshToken,
                isAuthenticated: true
              })
              try {
                const profile = await getUserProfile() as any
                const currentUser = get().user
                const updatedUser: User = {
                  id: profile.id ?? currentUser?.id ?? '',
                  username: profile.username ?? profile.fullName ?? currentUser?.username ?? '',
                  email: profile.email ?? currentUser?.email ?? '',
                  role: profile.role ?? currentUser?.role ?? 'USER',
                  isAuthor: profile.isAuthor ?? currentUser?.isAuthor ?? false,
                  fullName: profile.fullName ?? currentUser?.fullName ?? '',
                  avatarUrl: profile.avatarUrl ?? currentUser?.avatarUrl ?? undefined,
                  coinBalance: profile.coinBalance ?? currentUser?.coinBalance ?? 0,
                }
                _setUser(updatedUser)
              } catch {
                // profile fetch thất bại nhưng token vẫn còn hợp lệ, giữ nguyên user cũ
              }
              _setLoading(false)
              return
            }
          } catch {
            // Thất bại trong việc refresh session tự động → logout sạch
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
            _setLoading(false)
            return
          }
        }
        try {
          // getUserProfile trả ProfileDTO (fullName, email, phone, address)
          // Dùng any vì ProfileDTO không chứa id/role – giữ lại từ state cũ
          const profile = await getUserProfile() as any
          const currentUser = get().user
          const updatedUser: User = {
            id: profile.id ?? currentUser?.id ?? '',
            username: profile.username ?? profile.fullName ?? currentUser?.username ?? '',
            email: profile.email ?? currentUser?.email ?? '',
            role: profile.role ?? currentUser?.role ?? 'USER',
            isAuthor: profile.isAuthor ?? currentUser?.isAuthor ?? false,
            fullName: profile.fullName ?? currentUser?.fullName ?? '',
            avatarUrl: profile.avatarUrl ?? currentUser?.avatarUrl ?? undefined,
            coinBalance: profile.coinBalance ?? currentUser?.coinBalance ?? 0,
          }
          _setUser(updatedUser)
        } catch (error) {
          console.warn('Failed to verify profile session:', error)
          set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
        } finally {
          _setLoading(false)
        }
      },


      // ── Internal helpers ───────────────────────────────────────────────
      _setLoading: (v) => set({ isLoading: v }),
      _setUser: (user) => set({ user, isAuthenticated: !!user }),
    }),

    {
      name: 'auth',
      // Dùng sessionStorage thay vì localStorage:
      //   ✅ Sống qua F5 (khác RAM/Zustand thuần)
      //   ✅ Tự xóa khi đóng tab/trình duyệt (an toàn hơn localStorage với token nhạy cảm)
      //   ✅ Không bị chia sẻ giữa các tab khác nhau
      storage: createJSONStorage(() => sessionStorage),
      // Persist user + refreshToken. accessToken vẫn chỉ sống trong RAM (không persist).
      partialize: (state) => ({
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
