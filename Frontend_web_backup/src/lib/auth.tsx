import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

// ─── Re-export shared types ──────────────────────────────────────────────────
export type { User } from '@/types'


// ─── useAuth ─────────────────────────────────────────────────────────────────
// Thin wrapper — identical API as before, zero call-site changes required.

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, refreshProfile } = useAuthStore()
  return { user, token, isAuthenticated, isLoading, login, logout, refreshProfile }
}

// ─── AuthProvider ─────────────────────────────────────────────────────────────
// No longer a Context.Provider — just a bootstrap component that verifies the
// persisted token once on mount. Children render immediately; loading state is
// read from the store by guards/layouts that need it.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { refreshProfile } = useAuthStore()

  useEffect(() => {
    // Luôn luôn chạy refreshProfile trên mount để tự động khôi phục phiên (Silent Refresh) từ HttpOnly Cookie
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  return <>{children}</>
}

// ─── Utility helpers (unchanged signatures) ───────────────────────────────────

export function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated
}

export function getAuthUser() {
  return useAuthStore.getState().user
}

// ─── Route Guards ─────────────────────────────────────────────────────────────

/** Allows only unauthenticated (guest) users. Redirects authenticated users to /. */
export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (isAuthenticated) {
    const fromState = (location.state as any)?.from
    let target = '/'
    if (typeof fromState === 'string' && fromState) {
      target = fromState
    } else if (fromState?.pathname) {
      target = `${fromState.pathname}${fromState.search || ''}${fromState.hash || ''}`
    }
    const isAuthPage = ['/login', '/register', '/forgot-password', '/verify-otp'].some(p => target.startsWith(p))
    return <Navigate to={isAuthPage ? '/' : target} replace />
  }

  return <>{children}</>
}

/** Allows only authenticated users. Redirects guests to /login. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

/** Allows access only when there is an active pending payment in sessionStorage. */
export function RequirePaymentAccess({ children }: { children: React.ReactNode }) {
  const pending = typeof window !== 'undefined' ? sessionStorage.getItem('pendingPaymentId') : null

  if (!pending) {
    return <Navigate to="/payment/create" replace />
  }

  return <>{children}</>
}

export default {
  isAuthenticated,
  getAuthUser,
  GuestOnly,
  RequireAuth,
  RequirePaymentAccess,
}
